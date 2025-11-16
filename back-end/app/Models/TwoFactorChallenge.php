<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TwoFactorChallenge extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'channel',
        'code_hash',
        'expires_at',
        'attempts',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (TwoFactorChallenge $challenge) {
            $challenge->id = $challenge->id ?: (string) Str::uuid();
        });
    }

    public function mfaable(): MorphTo
    {
        return $this->morphTo();
    }

    public function hasExpired(): bool
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    public function markConsumed(): void
    {
        $this->forceFill(['consumed_at' => Carbon::now()])->save();
    }

    public function matchesCode(string $code): bool
    {
        return Hash::check($code, $this->code_hash);
    }
}
















