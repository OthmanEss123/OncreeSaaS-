<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CraSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultant_id',
        'work_schedule_id',
        'client_id',
        'manager_id',
        'month',
        'year',
        // Nouvelles colonnes pour chaque type de signature
        'consultant_signature_data',
        'consultant_signed_at',
        'consultant_signer_id',
        'client_signature_data',
        'client_signed_at',
        'client_signer_id',
        'manager_signature_data',
        'manager_signed_at',
        'manager_signer_id'
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'consultant_signed_at' => 'datetime',
        'client_signed_at' => 'datetime',
        'manager_signed_at' => 'datetime',
        'month' => 'integer',
        'year' => 'integer'
    ];

    /**
     * Relation avec le consultant
     */
    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    /**
     * Relation avec le work schedule
     */
    public function workSchedule(): BelongsTo
    {
        return $this->belongsTo(WorkSchedule::class, 'work_schedule_id');
    }

    /**
     * Relation avec le client
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relation avec le manager
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class);
    }
}
