<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name'];

    public function consultants()
    {
        return $this->belongsToMany(User::class, 'consultant_skill', 'skill_id', 'consultant_id');
    }
}
