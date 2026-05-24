<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeavingCalculation extends Model
{
    protected $fillable = [
        'shift_group_id', 'shift_period', 'production_order', 'machine_id',
        'tube_type_id', 'weaving_style', 'body_tension', 'twisting_length',
        'total_rolls', 'total_roll_produced', 'total_warp_ends', 'plastic_tube_weight',
        'standard_roll_length', 'adjustment_length',
        'adjustment_length_2', 'total_roll_produced_2', 'adjustment_length_3', 'total_roll_produced_3',
        'remarks',
        'gpm_1', 'gpm_2',
        'ao_sample_1', 'ao_sample_2',
        'ai_sample_1', 'ai_sample_2', 'ai_sample_3', 'ai_sample_4',
        'bi_sample_1', 'bi_sample_2', 'bi_sample_3', 'bi_sample_4',
        'bo_sample_1', 'bo_sample_2',
        'standard_creel_length_snapshot', 'quality_factor_snapshot', 'tolerance_kg_snapshot',
        'actual_length', 'actual_gpm', 'min_required_bobbin_weight',
        'avg_bobbin_weight', 'waste_estimate_kg', 'standard_waste_kg',
        'roll_status', 'waste_status', 'calculated_at',
    ];

    protected $casts = [
        'calculated_at' => 'datetime',
    ];

    public function shiftGroup(): BelongsTo
    {
        return $this->belongsTo(ShiftGroup::class);
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function tubeType(): BelongsTo
    {
        return $this->belongsTo(TubeType::class);
    }
}
