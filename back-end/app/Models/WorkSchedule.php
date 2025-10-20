<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultant_id',
        'date',
        'period',  // Ajout du champ period (morning/evening)
        'notes',
        'selected_days', // Nouveau: stocke les jours sélectionnés avec leurs périodes
        'work_type_selected_days', // Nouveau: jours sélectionnés pour types de travail
        'leave_type_selected_days', // Nouveau: jours sélectionnés pour congés
        'days_worked',
        'work_type_days',
        'weekend_worked',
        'absence_type',
        'absence_days',
        'month',
        'year',
        'work_type_id',
        'leave_type_id'
    ];

    protected $casts = [
        'date' => 'date',
        'weekend_worked' => 'decimal:1',  // Nombre de jours de week-end travaillés
        'days_worked' => 'decimal:1',
        'work_type_days' => 'decimal:1',
        'absence_days' => 'decimal:1',
        'month' => 'integer',
        'year' => 'integer',
        'selected_days' => 'array',  // Convertir automatiquement le JSON en array
        'work_type_selected_days' => 'array', // Convertir automatiquement le JSON en array
        'leave_type_selected_days' => 'array' // Convertir automatiquement le JSON en array
    ];

    // Relations
    public function consultant()
    {
        return $this->belongsTo(Consultant::class);
    }

    public function workType()
    {
        return $this->belongsTo(WorkType::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    // Scopes
    public function scopeByConsultant($query, $consultantId)
    {
        return $query->where('consultant_id', $consultantId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeByMonth($query, $month, $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    public function scopeWorkDays($query)
    {
        return $query->whereNotNull('work_type_id');
    }

    public function scopeAbsences($query)
    {
        return $query->whereNotNull('leave_type_id');
    }
}
