<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Consultant extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = [
        'first_name','last_name','email','password','phone','role','skills',
        'daily_rate','status','client_id','address','project_id'
    ];
    protected $table = 'consultants';       // nom de la table dans la base de données
    protected $hidden = ['password'];

    // Accesseur virtuel pour maintenir la compatibilité
    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    // S'assurer que l'accesseur virtuel est inclus dans la sérialisation JSON
    protected $appends = ['name'];

    public function client()      { return $this->belongsTo(Client::class); }
    public function assignments() { return $this->hasMany(Assignment::class); }
    public function workSchedules(){ return $this->hasMany(WorkSchedule::class); }
    public function factures()    { return $this->hasMany(Facture::class); }
    public function project()
{
    return $this->belongsTo(Project::class);
}

    public function twoFactorSetting()
    {
        return $this->morphOne(TwoFactorSetting::class, 'mfaable');
    }

    public function twoFactorChallenges()
    {
        return $this->morphMany(TwoFactorChallenge::class, 'mfaable');
    }

}
