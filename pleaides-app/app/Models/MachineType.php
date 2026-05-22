<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MachineType extends Model
{
    protected $fillable = ['type_name', 'description'];

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class, 'type_id');
    }

    public function cleaningCycles(): HasMany
    {
        return $this->hasMany(CleaningCycle::class, 'type_id');
    }

    public function activeCycle(): HasOne
    {
        return $this->hasOne(CleaningCycle::class, 'type_id')->where('is_active', true);
    }
}
