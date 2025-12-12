<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleContest extends Model
{
    use HasFactory;

    protected $table = 'schedule_contests';

    protected $fillable = [
        'client_id',
        'consultant_id',
        'work_schedule_id',
        'justification',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function consultant()
    {
        return $this->belongsTo(Consultant::class, 'consultant_id');
    }

    public function workSchedule()
    {
        return $this->belongsTo(WorkSchedule::class, 'work_schedule_id');
    }
}
