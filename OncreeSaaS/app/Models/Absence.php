<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;
    protected $fillable = ['consultant_id', 'type', 'start_date', 'end_date', 'status'];

    public function consultant()
    {
        return $this->belongsTo(Consultant::class);
    }
}