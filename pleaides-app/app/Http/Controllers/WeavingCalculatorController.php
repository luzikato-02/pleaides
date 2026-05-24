<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\ProductionArea;
use App\Models\ShiftGroup;
use App\Models\TubeType;
use Inertia\Inertia;
use Inertia\Response;

class WeavingCalculatorController extends Controller
{
    public function index(): Response
    {
        $weavingArea = ProductionArea::where('area_name', 'Weaving')->first();

        $weavingMachines = Machine::query()
            ->when($weavingArea, fn ($q) => $q->where('production_area_id', $weavingArea->id))
            ->where('status', 'Active')
            ->with('weavingStandard')
            ->orderBy('machine_name')
            ->get(['id', 'machine_name', 'machine_code'])
            ->map(fn ($m) => [
                'id' => $m->id,
                'machine_name' => $m->machine_name,
                'machine_code' => $m->machine_code,
                'standard_creel_length' => $m->weavingStandard ? (float) $m->weavingStandard->standard_creel_length : null,
                'quality_factor' => $m->weavingStandard ? (float) $m->weavingStandard->quality_factor : null,
                'tolerance_kg' => $m->weavingStandard?->tolerance_kg !== null ? (float) $m->weavingStandard->tolerance_kg : null,
            ]);

        return Inertia::render('weaving-calculator', [
            'shiftGroups' => ShiftGroup::where('status', 'Active')
                ->orderBy('group_name')
                ->get(['id', 'group_name']),
            'weavingMachines' => $weavingMachines,
            'tubeTypes' => TubeType::where('status', 'Active')->orderBy('tube_name')->get(['id', 'tube_name', 'basic_weight']),
        ]);
    }
}
