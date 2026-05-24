<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\ProductionArea;
use App\Models\WeavingMachineStandard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeavingMachineStandardController extends Controller
{
    public function index(): Response
    {
        $weavingArea = ProductionArea::where('area_name', 'Weaving')->first();

        $machines = Machine::query()
            ->when($weavingArea, fn ($q) => $q->where('production_area_id', $weavingArea->id))
            ->with('weavingStandard')
            ->orderBy('machine_name')
            ->get(['id', 'machine_name', 'machine_code', 'status', 'production_area_id']);

        return Inertia::render('weaving-machine-standards/index', [
            'machines' => $machines,
        ]);
    }

    public function create(): Response
    {
        $weavingArea = ProductionArea::where('area_name', 'Weaving')->first();

        $configuredIds = WeavingMachineStandard::pluck('machine_id');

        $availableMachines = Machine::query()
            ->when($weavingArea, fn ($q) => $q->where('production_area_id', $weavingArea->id))
            ->whereNotIn('id', $configuredIds)
            ->orderBy('machine_name')
            ->get(['id', 'machine_name', 'machine_code']);

        return Inertia::render('weaving-machine-standards/form', [
            'availableMachines' => $availableMachines,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'machine_id' => 'required|exists:machines,id|unique:weaving_machine_standards',
            'standard_creel_length' => 'required|numeric|min:0',
            'quality_factor' => 'required|numeric|min:0',
            'tolerance_kg' => 'nullable|numeric|min:0',
        ]);

        WeavingMachineStandard::create(
            $request->only('machine_id', 'standard_creel_length', 'quality_factor', 'tolerance_kg')
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Standard configured.']);

        return to_route('weaving-machine-standards.index');
    }

    public function edit(WeavingMachineStandard $weavingMachineStandard): Response
    {
        $weavingMachineStandard->load('machine');

        return Inertia::render('weaving-machine-standards/form', [
            'standard' => $weavingMachineStandard,
            'availableMachines' => collect([$weavingMachineStandard->machine])
                ->map(fn ($m) => ['id' => $m->id, 'machine_name' => $m->machine_name, 'machine_code' => $m->machine_code]),
        ]);
    }

    public function update(Request $request, WeavingMachineStandard $weavingMachineStandard): RedirectResponse
    {
        $request->validate([
            'standard_creel_length' => 'required|numeric|min:0',
            'quality_factor' => 'required|numeric|min:0',
            'tolerance_kg' => 'nullable|numeric|min:0',
        ]);

        $weavingMachineStandard->update(
            $request->only('standard_creel_length', 'quality_factor', 'tolerance_kg')
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Standard updated.']);

        return to_route('weaving-machine-standards.index');
    }

    public function destroy(WeavingMachineStandard $weavingMachineStandard): RedirectResponse
    {
        $weavingMachineStandard->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Standard removed.']);

        return to_route('weaving-machine-standards.index');
    }
}
