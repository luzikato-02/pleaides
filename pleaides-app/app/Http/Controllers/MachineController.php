<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MachineType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineController extends Controller
{
    public function index(): Response
    {
        $machines = Machine::with(['machineType', 'latestCleaningRecord'])
            ->latest()
            ->get()
            ->map(fn ($m) => array_merge($m->toArray(), ['due_status' => $m->due_status]));

        return Inertia::render('machines/index', [
            'machines' => $machines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('machines/form', [
            'machineTypes' => MachineType::orderBy('type_name')->get(['id', 'type_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'machine_code' => 'required|string|max:255|unique:machines',
            'machine_name' => 'required|string|max:255',
            'type_id' => 'required|exists:machine_types,id',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Active,Inactive,Decommissioned',
        ]);

        Machine::create($request->only('machine_code', 'machine_name', 'type_id', 'location', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine created.']);

        return to_route('machines.index');
    }

    public function edit(Machine $machine): Response
    {
        return Inertia::render('machines/form', [
            'machine' => $machine,
            'machineTypes' => MachineType::orderBy('type_name')->get(['id', 'type_name']),
        ]);
    }

    public function update(Request $request, Machine $machine): RedirectResponse
    {
        $request->validate([
            'machine_code' => 'required|string|max:255|unique:machines,machine_code,'.$machine->id,
            'machine_name' => 'required|string|max:255',
            'type_id' => 'required|exists:machine_types,id',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Active,Inactive,Decommissioned',
        ]);

        $machine->update($request->only('machine_code', 'machine_name', 'type_id', 'location', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine updated.']);

        return to_route('machines.index');
    }

    public function destroy(Machine $machine): RedirectResponse
    {
        $machine->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine deleted.']);

        return to_route('machines.index');
    }
}
