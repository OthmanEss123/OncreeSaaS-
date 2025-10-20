<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Client extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;
    protected $table = 'clients';       // nom de la table dans la base de données
    protected $fillable = [
        'company_name','contact_name','contact_email','contact_phone','role','password','address'
    ];

    public function managers()   { return $this->hasMany(\App\Models\Manager::class); }
    public function rh()         { return $this->hasMany(\App\Models\Rh::class); }
    public function comptables() { return $this->hasMany(\App\Models\Comptable::class); }
    public function consultants(){ return $this->hasMany(\App\Models\Consultant::class); }
    public function projects()   { return $this->hasMany(\App\Models\Project::class); }
    public function quotes()     { return $this->hasMany(\App\Models\Quote::class); }
    public function factures()   { return $this->hasMany(\App\Models\Facture::class); }
    protected $hidden = ['password'];

}
