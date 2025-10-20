<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'is_paid',
        'requires_approval',
        'max_days_per_year',
        'requires_medical_certificate'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_paid' => 'boolean',
        'requires_approval' => 'boolean',
        'requires_medical_certificate' => 'boolean',
        'max_days_per_year' => 'integer'
    ];

    // Relations
    public function workSchedules()
    {
        return $this->hasMany(WorkSchedule::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    public function scopeRequiresApproval($query)
    {
        return $query->where('requires_approval', true);
    }

    public function scopeRequiresMedicalCertificate($query)
    {
        return $query->where('requires_medical_certificate', true);
    }
}
