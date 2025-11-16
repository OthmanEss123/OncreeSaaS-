<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Manager extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = ['name','email','password','phone','role','client_id'];

    protected $hidden = ['password'];

    public function client() { return $this->belongsTo(Client::class); }
    public function factures() { return $this->hasMany(Facture::class,'created_by_manager'); }

    public function twoFactorSetting()
    {
        return $this->morphOne(TwoFactorSetting::class, 'mfaable');
    }

    public function twoFactorChallenges()
    {
        return $this->morphMany(TwoFactorChallenge::class, 'mfaable');
    }
}
