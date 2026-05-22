<?php

namespace App\Http\Controllers;

use App\Models\CleaningCycle;
use App\Models\MachineType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CleaningCycleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cleaning-cycles/index', [
            'cycles' => CleaningCycle::with('machineType')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cleaning-cycles/form', [
            'machineTypes' => MachineType::orderBy('type_name')->get(['id', 'type_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type_id' => 'required|exists:machine_types,id',
            'frequency_value' => 'required|integer|min:1',
            'frequency_unit' => 'required|in:days,weeks',
            'cleaning_steps' => 'nullable|string',
            'effective_date' => 'required|date',
            'is_active' => 'boolean',
        ]);

        if ($request->boolean('is_active')) {
            CleaningCycle::where('type_id', $request->type_id)->update(['is_active' => false]);
        }

        CleaningCycle::create($request->only(
            'type_id', 'frequency_value', 'frequency_unit',
            'cleaning_steps', 'effective_date', 'is_active'
        ));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cleaning cycle created.']);

        return to_route('cleaning-cycles.index');
    }

    public function edit(CleaningCycle $cleaningCycle): Response
    {
        return Inertia::render('cleaning-cycles/form', [
            'cycle' => $cleaningCycle,
            'machineTypes' => MachineType::orderBy('type_name')->get(['id', 'type_name']),
        ]);
    }

    public function update(Request $request, CleaningCycle $cleaningCycle): RedirectResponse
    {
        $request->validate([
            'type_id' => 'required|exists:machine_types,id',
            'frequency_value' => 'required|integer|min:1',
            'frequency_unit' => 'required|in:days,weeks',
            'cleaning_steps' => 'nullable|string',
            'effective_date' => 'required|date',
            'is_active' => 'boolean',
        ]);

        if ($request->boolean('is_active')) {
            CleaningCycle::where('type_id', $request->type_id)
                ->where('id', '!=', $cleaningCycle->id)
                ->update(['is_active' => false]);
        }

        $cleaningCycle->update($request->only(
            'type_id', 'frequency_value', 'frequency_unit',
            'cleaning_steps', 'effective_date', 'is_active'
        ));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cleaning cycle updated.']);

        return to_route('cleaning-cycles.index');
    }

    public function destroy(CleaningCycle $cleaningCycle): RedirectResponse
    {
        $cleaningCycle->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cleaning cycle deleted.']);

        return to_route('cleaning-cycles.index');
    }
}
