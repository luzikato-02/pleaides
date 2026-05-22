<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CleaningCycle extends Model
{
    protected $fillable = [
        'type_id',
        'frequency_value',
        'frequency_unit',
        'cleaning_steps',
        'effective_date',
        'is_active',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function machineType(): BelongsTo
    {
        return $this->belongsTo(MachineType::class, 'type_id');
    }

    public function frequencyInDays(): int
    {
        return match ($this->frequency_unit) {
            'weeks' => $this->frequency_value * 7,
            default => $this->frequency_value,
        };
    }
}
