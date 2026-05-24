<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeavingMachineStandard extends Model
{
    protected $fillable = ['machine_id', 'standard_creel_length', 'quality_factor', 'tolerance_kg'];

    protected $casts = [
        'standard_creel_length' => 'decimal:3',
        'quality_factor' => 'decimal:4',
        'tolerance_kg' => 'decimal:3',
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
