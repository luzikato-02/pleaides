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

class CleaningRecordController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cleaning-records/index', [
            'records' => CleaningRecord::with(['machine', 'performedByGroup', 'startedByGroup'])
                ->latest('cleaning_date')
                ->paginate(25),
        ]);
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

        // Snapshot leader names at time of cleaning
        $performer = ShiftGroup::findOrFail($request->performed_by_group_id);
        $starter = ShiftGroup::findOrFail($request->started_by_group_id);

        // Calculate duration_since_last
        $previousRecord = CleaningRecord::where('machine_id', $machine->id)
            ->latest('cleaning_date')
            ->first();

        $durationSinceLast = null;
        if ($previousRecord) {
            $durationSinceLast = Carbon::parse($previousRecord->cleaning_date)
                ->diffInDays($cleaningDate);
        }

        // Calculate next_due_date from active cycle
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
