<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftGroup extends Model
{
    protected $fillable = ['group_name', 'leader_name', 'status'];

    public function cleaningRecordsAsPerformer(): HasMany
    {
        return $this->hasMany(CleaningRecord::class, 'performed_by_group_id');
    }

    public function cleaningRecordsAsStarter(): HasMany
    {
        return $this->hasMany(CleaningRecord::class, 'started_by_group_id');
    }
}
