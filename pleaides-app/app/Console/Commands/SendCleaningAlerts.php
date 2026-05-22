<?php

namespace App\Console\Commands;

use App\Models\Machine;
use App\Models\Stakeholder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendCleaningAlerts extends Command
{
    protected $signature = 'cleaning:send-alerts';

    protected $description = 'Evaluate machine due status and email stakeholders a daily digest';

    public function handle(): int
    {
        $settings = DB::table('alert_settings')->first();
        $warningDays = $settings?->warning_window_days ?? 3;

        $machines = Machine::with(['machineType', 'latestCleaningRecord'])
            ->where('status', 'Active')
            ->get()
            ->map(fn ($m) => array_merge($m->toArray(), ['due_status' => $m->due_status]))
            ->filter(fn ($m) => in_array($m['due_status'], ['Due soon', 'Overdue']));

        if ($machines->isEmpty()) {
            $this->info('No machines due soon or overdue.');

            return self::SUCCESS;
        }

        $stakeholders = Stakeholder::where('status', 'Active')->get();

        foreach ($stakeholders as $stakeholder) {
            $relevant = $machines->filter(function ($machine) use ($stakeholder) {
                $inScope = $stakeholder->scope === 'all'
                    || str_starts_with($stakeholder->scope, 'type_id:'.$machine['type_id'])
                    || ($machine['location'] && str_starts_with($stakeholder->scope, 'location:'.$machine['location']));

                if (! $inScope) {
                    return false;
                }

                return match ($stakeholder->severity) {
                    'due-soon' => $machine['due_status'] === 'Due soon',
                    'overdue' => $machine['due_status'] === 'Overdue',
                    default => true,
                };
            });

            if ($relevant->isEmpty()) {
                continue;
            }

            $this->sendDigest($stakeholder, $relevant->values());
        }

        $this->info('Cleaning alerts sent.');

        return self::SUCCESS;
    }

    private function sendDigest(Stakeholder $stakeholder, $machines): void
    {
        $lines = $machines->map(fn ($m) => sprintf(
            '[%s] %s (%s) — %s — Next due: %s',
            $m['due_status'],
            $m['machine_name'],
            $m['machine_code'],
            $m['location'] ?? 'No location',
            $m['latest_cleaning_record']['next_due_date'] ?? 'N/A'
        ))->implode("\n");

        Mail::raw(
            "Cleaning Alert Digest — ".Carbon::today()->toFormattedDateString()."\n\n".$lines,
            fn ($msg) => $msg
                ->to($stakeholder->email, $stakeholder->name)
                ->subject('Cleaning Alert Digest — '.Carbon::today()->toFormattedDateString())
        );
    }
}
