<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $machines = Machine::with([
            'machineType',
            'latestCleaningRecord.performedByGroup',
            'latestCleaningRecord.startedByGroup',
            'cleaningRecords' => fn ($q) => $q
                ->with(['performedByGroup', 'startedByGroup'])
                ->orderByDesc('cleaning_date'),
        ])
            ->where('status', 'Active')
            ->orderBy('machine_name')
            ->get()
            ->map(fn ($m) => array_merge($m->toArray(), ['due_status' => $m->due_status]));

        $grouped = [
            'Overdue' => $machines->where('due_status', 'Overdue')->values(),
            'Due soon' => $machines->where('due_status', 'Due soon')->values(),
            'OK' => $machines->where('due_status', 'OK')->values(),
            'No Record' => $machines->where('due_status', 'No Record')->values(),
        ];

        return Inertia::render('dashboard', [
            'machines' => $machines->values(),
            'grouped' => $grouped,
            'counts' => [
                'overdue' => $grouped['Overdue']->count(),
                'due_soon' => $grouped['Due soon']->count(),
                'ok' => $grouped['OK']->count(),
                'no_record' => $grouped['No Record']->count(),
            ],
        ]);
    }
}
