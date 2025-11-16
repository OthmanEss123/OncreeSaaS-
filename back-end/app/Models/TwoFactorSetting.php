<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TwoFactorSetting extends Model
{
    protected $fillable = [
        'mfaable_type',
        'mfaable_id',
        'channel',
        'enabled',
        'secret',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public function mfaable(): MorphTo
    {
        return $this->morphTo();
    }
}








