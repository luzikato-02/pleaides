<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\ProductionArea;
use App\Models\ShiftGroup;
use App\Models\TubeType;
use App\Models\WeavingCalculation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeavingCalculationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = WeavingCalculation::with(['shiftGroup', 'machine'])
            ->latest('calculated_at');

        if ($request->filled('machine_id')) {
            $query->where('machine_id', $request->machine_id);
        }

        if ($request->filled('roll_status')) {
            $query->where('roll_status', $request->roll_status);
        }

        if ($request->filled('waste_status')) {
            $query->where('waste_status', $request->waste_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('calculated_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('calculated_at', '<=', $request->date_to);
        }

        return Inertia::render('weaving-calculations/index', [
            'records' => $query->paginate(20)->withQueryString(),
            'machines' => $this->weavingMachines()->map(fn ($m) => ['id' => $m['id'], 'machine_name' => $m['machine_name'], 'machine_code' => $m['machine_code']]),
            'filters' => $request->only('machine_id', 'roll_status', 'waste_status', 'date_from', 'date_to'),
        ]);
    }

    public function show(WeavingCalculation $weavingCalculation): Response
    {
        $weavingCalculation->load(['shiftGroup', 'machine']);

        return Inertia::render('weaving-calculations/show', [
            'record' => $weavingCalculation,
        ]);
    }

    private function weavingMachines(): \Illuminate\Support\Collection
    {
        $weavingArea = ProductionArea::where('area_name', 'Weaving')->first();

        return Machine::query()
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
    }

    private function shiftGroups(): \Illuminate\Database\Eloquent\Collection
    {
        return ShiftGroup::where('status', 'Active')->orderBy('group_name')->get(['id', 'group_name']);
    }

    private function tubeTypes(): \Illuminate\Database\Eloquent\Collection
    {
        return TubeType::where('status', 'Active')->orderBy('tube_name')->get(['id', 'tube_name', 'basic_weight']);
    }

    private function validationRules(): array
    {
        return [
            'shift_group_id'    => 'nullable|exists:shift_groups,id',
            'shift_period'      => 'nullable|string|max:10',
            'production_order'  => 'nullable|string|max:255',
            'machine_id'        => 'nullable|exists:machines,id',
            'tube_type_id'      => 'nullable|exists:tube_types,id',
            'weaving_style'     => 'nullable|string|max:255',
            'body_tension'      => 'nullable|numeric|min:0',
            'twisting_length'   => 'nullable|numeric|min:0',
            'total_rolls'       => 'nullable|numeric|min:0',
            'total_roll_produced' => 'nullable|numeric|min:0',
            'total_warp_ends'   => 'nullable|numeric|min:0',
            'plastic_tube_weight' => 'nullable|numeric|min:0',
            'standard_roll_length' => 'nullable|numeric|min:0',
            'adjustment_length'   => 'nullable|numeric',
            'adjustment_length_2'   => 'nullable|numeric',
            'total_roll_produced_2' => 'nullable|numeric|min:0',
            'adjustment_length_3'   => 'nullable|numeric',
            'total_roll_produced_3' => 'nullable|numeric|min:0',
            'remarks'           => 'nullable|string',
            'gpm_1'             => 'nullable|numeric|min:0',
            'gpm_2'             => 'nullable|numeric|min:0',
            'ao_sample_1'       => 'nullable|numeric|min:0',
            'ao_sample_2'       => 'nullable|numeric|min:0',
            'ai_sample_1'       => 'nullable|numeric|min:0',
            'ai_sample_2'       => 'nullable|numeric|min:0',
            'ai_sample_3'       => 'nullable|numeric|min:0',
            'ai_sample_4'       => 'nullable|numeric|min:0',
            'bi_sample_1'       => 'nullable|numeric|min:0',
            'bi_sample_2'       => 'nullable|numeric|min:0',
            'bi_sample_3'       => 'nullable|numeric|min:0',
            'bi_sample_4'       => 'nullable|numeric|min:0',
            'bo_sample_1'       => 'nullable|numeric|min:0',
            'bo_sample_2'       => 'nullable|numeric|min:0',
            'standard_creel_length_snapshot' => 'nullable|numeric|min:0',
            'quality_factor_snapshot'        => 'nullable|numeric|min:0',
            'tolerance_kg_snapshot'          => 'nullable|numeric|min:0',
            'actual_length'             => 'nullable|numeric',
            'actual_gpm'                => 'nullable|numeric|min:0',
            'min_required_bobbin_weight' => 'nullable|numeric',
            'avg_bobbin_weight'         => 'nullable|numeric|min:0',
            'waste_estimate_kg'         => 'nullable|numeric',
            'standard_waste_kg'         => 'nullable|numeric|min:0',
            'roll_status'  => 'nullable|string|in:sufficient,short,pending',
            'waste_status' => 'nullable|string|in:within,excess,no-data',
        ];
    }

    public function edit(WeavingCalculation $weavingCalculation): Response
    {
        return Inertia::render('weaving-calculations/edit', [
            'record'          => $weavingCalculation,
            'shiftGroups'     => $this->shiftGroups(),
            'weavingMachines' => $this->weavingMachines(),
            'tubeTypes'       => $this->tubeTypes(),
        ]);
    }

    public function update(Request $request, WeavingCalculation $weavingCalculation): RedirectResponse
    {
        $request->validate($this->validationRules());

        $weavingCalculation->update($request->except(['_token', '_method']));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Calculation updated.']);

        return to_route('weaving-calculations.show', $weavingCalculation);
    }

    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $query = WeavingCalculation::with(['shiftGroup', 'machine'])->latest('calculated_at');

        if ($request->filled('machine_id'))  $query->where('machine_id',  $request->machine_id);
        if ($request->filled('roll_status')) $query->where('roll_status', $request->roll_status);
        if ($request->filled('waste_status'))$query->where('waste_status',$request->waste_status);
        if ($request->filled('date_from'))   $query->whereDate('calculated_at', '>=', $request->date_from);
        if ($request->filled('date_to'))     $query->whereDate('calculated_at', '<=', $request->date_to);

        $records  = $query->get();
        $filename = 'weaving-calculations-' . now()->format('Y-m-d') . '.csv';

        return response()->stream(function () use ($records) {
            $f = fopen('php://output', 'w');
            fputcsv($f, [
                'Date/Time', 'Loom', 'Shift Group', 'Period', 'Production Order', 'Weaving Style',
                'Body Tension', 'Twisting Length (m)',
                'Total Rolls', 'Roll Produced', 'Warp Ends', 'Tube Wt (g)',
                'Std Roll Length (m)', 'Adjustment (m)', 'Adj 2 (m)', 'Rolls 2', 'Adj 3 (m)', 'Rolls 3',
                'G/m 1', 'G/m 2',
                'AO1', 'AO2', 'AI1', 'AI2', 'AI3', 'AI4', 'BI1', 'BI2', 'BI3', 'BI4', 'BO1', 'BO2',
                'Std Creel Length', 'Quality Factor',
                'Actual Length (m)', 'Actual G/m', 'Min Bobbin (g)', 'Avg Bobbin (g)',
                'Waste Est. (kg)', 'Std Waste (kg)', 'Roll Status', 'Waste Status',
                'Remarks',
            ]);
            foreach ($records as $r) {
                fputcsv($f, [
                    $r->calculated_at,
                    $r->machine ? "{$r->machine->machine_name} ({$r->machine->machine_code})" : null,
                    $r->shiftGroup?->group_name, $r->shift_period, $r->production_order,
                    $r->weaving_style, $r->body_tension, $r->twisting_length,
                    $r->total_rolls, $r->total_roll_produced, $r->total_warp_ends, $r->plastic_tube_weight,
                    $r->standard_roll_length, $r->adjustment_length,
                    $r->adjustment_length_2, $r->total_roll_produced_2,
                    $r->adjustment_length_3, $r->total_roll_produced_3,
                    $r->gpm_1, $r->gpm_2,
                    $r->ao_sample_1, $r->ao_sample_2,
                    $r->ai_sample_1, $r->ai_sample_2, $r->ai_sample_3, $r->ai_sample_4,
                    $r->bi_sample_1, $r->bi_sample_2, $r->bi_sample_3, $r->bi_sample_4,
                    $r->bo_sample_1, $r->bo_sample_2,
                    $r->standard_creel_length_snapshot, $r->quality_factor_snapshot,
                    $r->actual_length, $r->actual_gpm,
                    $r->min_required_bobbin_weight, $r->avg_bobbin_weight,
                    $r->waste_estimate_kg, $r->standard_waste_kg,
                    $r->roll_status, $r->waste_status,
                    $r->remarks,
                ]);
            }
            fclose($f);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate($this->validationRules());

        WeavingCalculation::create($request->except('_token'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Calculation saved.']);

        return to_route('weaving-calculations.index');
    }
}
