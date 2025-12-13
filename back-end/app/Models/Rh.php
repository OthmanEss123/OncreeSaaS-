<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Rh extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = ['name','email','password','phone','role','client_id'];
    protected $hidden   = ['password'];
    protected $table = 'rh';       // nom de la table dans la base de données
    public function client() { return $this->belongsTo(Client::class); }
    public function conges() { return $this->hasMany(Conge::class); }

    public function twoFactorSetting()
    {
        return $this->morphOne(TwoFactorSetting::class, 'mfaable');
    }

    public function twoFactorChallenges()
    {
        return $this->morphMany(TwoFactorChallenge::class, 'mfaable');
    }
}
