<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'phone', 'role'];
    protected $hidden = ['password'];
    protected $table = 'admins';

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function twoFactorSetting()
    {
        return $this->morphOne(TwoFactorSetting::class, 'mfaable');
    }

    public function twoFactorChallenges()
    {
        return $this->morphMany(TwoFactorChallenge::class, 'mfaable');
    }
}




















