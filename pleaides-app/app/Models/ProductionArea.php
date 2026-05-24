<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionArea extends Model
{
    protected $fillable = ['area_name', 'description'];

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class);
    }
}
