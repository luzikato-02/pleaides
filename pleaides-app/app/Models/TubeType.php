<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TubeType extends Model
{
    protected $fillable = ['tube_name', 'basic_weight', 'status'];

    protected $casts = ['basic_weight' => 'decimal:3'];
}
