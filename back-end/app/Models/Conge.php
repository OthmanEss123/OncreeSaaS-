<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conge extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultant_id',
        'start_date',
        'end_date',
        'leave_type_id',
        'reason',
        'status',
        'rh_id',
        'rh_comment',
        'processed_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'processed_at' => 'datetime',
    ];

    // Relations
    public function consultant()
    {
        return $this->belongsTo(Consultant::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function rh()
    {
        return $this->belongsTo(Rh::class);
    }

    // Scopes
    public function scopeByConsultant($query, $consultantId)
    {
        return $query->where('consultant_id', $consultantId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_date', [$startDate, $endDate])
            ->orWhereBetween('end_date', [$startDate, $endDate])
            ->orWhere(function($q) use ($startDate, $endDate) {
                $q->where('start_date', '<=', $startDate)
                  ->where('end_date', '>=', $endDate);
            });
    }
}
