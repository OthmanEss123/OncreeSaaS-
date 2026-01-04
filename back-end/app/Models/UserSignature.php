<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_type',
        'user_id',
        'user_name',
        'user_email',
        'signature_data',
        'signed_at',
        'document_type',
        'document_id',
        'metadata',
        'consultant_id',
        'client_id',
        'manager_id',
        'month',
        'year'
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'metadata' => 'array',
        'month' => 'integer',
        'year' => 'integer'
    ];

    /**
     * Relation morphique avec l'utilisateur
     */
    public function user(): MorphTo
    {
        return $this->morphTo('user');
    }

    /**
     * Relation avec le consultant (si applicable)
     */
    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    /**
     * Relation avec le client (si applicable)
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relation avec le manager (si applicable)
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class);
    }
}
