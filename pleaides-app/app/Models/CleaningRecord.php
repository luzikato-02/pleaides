<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CleaningRecord extends Model
{
    protected $fillable = [
        'machine_id',
        'cleaning_date',
        'performed_by_group_id',
        'performed_by_leader',
        'started_by_group_id',
        'started_by_leader',
        'duration_since_last',
        'next_due_date',
        'notes',
    ];

    protected $casts = [
        'cleaning_date' => 'date:Y-m-d',
        'next_due_date' => 'date:Y-m-d',
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function performedByGroup(): BelongsTo
    {
        return $this->belongsTo(ShiftGroup::class, 'performed_by_group_id');
    }

    public function startedByGroup(): BelongsTo
    {
        return $this->belongsTo(ShiftGroup::class, 'started_by_group_id');
    }
}
