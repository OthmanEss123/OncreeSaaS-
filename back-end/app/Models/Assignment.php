<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = ['consultant_id','project_id','start_date','end_date'];

    public function consultant() { return $this->belongsTo(Consultant::class); }
    public function project()    { return $this->belongsTo(Project::class); }
}
