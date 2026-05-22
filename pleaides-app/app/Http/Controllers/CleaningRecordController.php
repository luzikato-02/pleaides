<?php

namespace App\Http\Controllers;

use App\Models\CleaningRecord;
use App\Models\Machine;
use App\Models\ShiftGroup;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CleaningRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CleaningRecord::with(['machine', 'performedByGroup', 'startedByGroup'])
            ->latest('cleaning_date');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('machine', fn ($m) => $m->where('machine_name', 'like', "%{$search}%")
                    ->orWhere('machine_code', 'like', "%{$search}%"))
                    ->orWhere('performed_by_leader', 'like', "%{$search}%")
                    ->orWhere('started_by_leader', 'like', "%{$search}%");
            });
        }

        if ($machineId = $request->input('machine_id')) {
            $query->where('machine_id', $machineId);
        }

        if ($groupId = $request->input('group_id')) {
            $query->where(function ($q) use ($groupId) {
                $q->where('performed_by_group_id', $groupId)
                    ->orWhere('started_by_group_id', $groupId);
            });
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('cleaning_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('cleaning_date', '<=', $dateTo);
        }

        return Inertia::render('cleaning-records/index', [
            'records' => $query->paginate(25)->withQueryString(),
            'machines' => Machine::orderBy('machine_name')->get(['id', 'machine_name', 'machine_code']),
            'shiftGroups' => ShiftGroup::orderBy('group_name')->get(['id', 'group_name']),
            'filters' => $request->only('search', 'machine_id', 'group_id', 'date_from', 'date_to'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = CleaningRecord::with(['machine', 'performedByGroup', 'startedByGroup'])
            ->latest('cleaning_date');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('machine', fn ($m) => $m->where('machine_name', 'like', "%{$search}%")
                    ->orWhere('machine_code', 'like', "%{$search}%"))
                    ->orWhere('performed_by_leader', 'like', "%{$search}%")
                    ->orWhere('started_by_leader', 'like', "%{$search}%");
            });
        }

        if ($machineId = $request->input('machine_id')) {
            $query->where('machine_id', $machineId);
        }

        if ($groupId = $request->input('group_id')) {
            $query->where(function ($q) use ($groupId) {
                $q->where('performed_by_group_id', $groupId)
                    ->orWhere('started_by_group_id', $groupId);
            });
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('cleaning_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('cleaning_date', '<=', $dateTo);
        }

        $records = $query->get();

        $filename = 'cleaning-records-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Machine', 'Code', 'Cleaned On', 'Performed By', 'Leader (snapshot)',
                'Restarted By', 'Restart Leader', 'Days Since Last', 'Next Due', 'Notes',
            ]);
            foreach ($records as $r) {
                fputcsv($handle, [
                    $r->machine?->machine_name ?? '',
                    $r->machine?->machine_code ?? '',
                    $r->cleaning_date,
                    $r->performedByGroup?->group_name ?? '',
                    $r->performed_by_leader,
                    $r->startedByGroup?->group_name ?? '',
                    $r->started_by_leader,
                    $r->duration_since_last ?? '',
                    $r->next_due_date,
                    $r->notes ?? '',
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function create(): Response
    {
        return Inertia::render('cleaning-records/create', [
            'machines' => Machine::where('status', 'Active')
                ->orderBy('machine_name')
                ->get(['id', 'machine_name', 'machine_code']),
            'shiftGroups' => ShiftGroup::where('status', 'Active')
                ->orderBy('group_name')
                ->get(['id', 'group_name', 'leader_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'machine_id' => 'required|exists:machines,id',
            'cleaning_date' => 'required|date',
            'performed_by_group_id' => 'required|exists:shift_groups,id',
            'started_by_group_id' => 'required|exists:shift_groups,id',
            'notes' => 'nullable|string',
        ]);

        $machine = Machine::with('machineType.activeCycle')->findOrFail($request->machine_id);
        $cleaningDate = Carbon::parse($request->cleaning_date);

        $performer = ShiftGroup::findOrFail($request->performed_by_group_id);
        $starter = ShiftGroup::findOrFail($request->started_by_group_id);

        $previousRecord = CleaningRecord::where('machine_id', $machine->id)
            ->latest('cleaning_date')
            ->first();

        $durationSinceLast = $previousRecord
            ? Carbon::parse($previousRecord->cleaning_date)->diffInDays($cleaningDate)
            : null;

        $cycle = $machine->machineType?->activeCycle;
        $nextDueDate = $cycle
            ? $cleaningDate->copy()->addDays($cycle->frequencyInDays())
            : $cleaningDate->copy()->addDays(7);

        CleaningRecord::create([
            'machine_id' => $machine->id,
            'cleaning_date' => $cleaningDate->toDateString(),
            'performed_by_group_id' => $performer->id,
            'performed_by_leader' => $performer->leader_name,
            'started_by_group_id' => $starter->id,
            'started_by_leader' => $starter->leader_name,
            'duration_since_last' => $durationSinceLast,
            'next_due_date' => $nextDueDate->toDateString(),
            'notes' => $request->notes,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cleaning logged successfully.']);

        return to_route('cleaning-records.index');
    }
}
