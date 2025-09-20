<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TimeTracking extends Model
{
    use HasFactory;

    // Supprimez cette ligne si elle existe :
    // protected $table = 'time_tracking';

    protected $fillable = ['mission_id','consultant_id','hours','date','notes'];
    protected $casts    = ['date' => 'date', 'hours' => 'decimal:2'];

    public function mission(){ return $this->belongsTo(Mission::class); }
    public function consultant(){ return $this->belongsTo(Consultant::class); }
}
