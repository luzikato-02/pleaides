<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Machine extends Model
{
    protected $fillable = ['machine_code', 'machine_name', 'type_id', 'location', 'status'];

    protected $appends = ['due_status'];

    public function machineType(): BelongsTo
    {
        return $this->belongsTo(MachineType::class, 'type_id');
    }

    public function cleaningRecords(): HasMany
    {
        return $this->hasMany(CleaningRecord::class);
    }

    public function latestCleaningRecord(): HasOne
    {
        return $this->hasOne(CleaningRecord::class)->latestOfMany('cleaning_date');
    }

    public function getDueStatusAttribute(): string
    {
        $latest = $this->latestCleaningRecord;

        if (! $latest) {
            return 'No Record';
        }

        $warningDays = \DB::table('alert_settings')->value('warning_window_days') ?? 3;
        $nextDue = Carbon::parse($latest->next_due_date);
        $today = Carbon::today();

        if ($nextDue->isPast()) {
            return 'Overdue';
        }

        if ($nextDue->diffInDays($today) <= $warningDays) {
            return 'Due soon';
        }

        return 'OK';
    }
}
