<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stakeholder extends Model
{
    protected $fillable = ['name', 'email', 'scope', 'severity', 'status'];
}
