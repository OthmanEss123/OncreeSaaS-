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
        'month',
        'year',
        'signature_data',
        'signed_at'
    ];

    protected $casts = [
        'signed_at' => 'datetime',
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
}
