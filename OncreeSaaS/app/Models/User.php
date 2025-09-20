<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use Notifiable, HasFactory;

    protected $fillable = [
        'name', 'email', 'password', 'role_id', 'address', 'phone', 
    ];

    protected $hidden = ['password', 'remember_token'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function consultant()
    {
        return $this->hasOne(Consultant::class);
    }
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Tous les consultants liés à ce client
    public function consultants()
    {
        return $this->hasMany(User::class, 'client_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'consultant_skill', 'consultant_id', 'skill_id');
    }
    protected $casts = [
        'skills' => 'array', // permet d'obtenir un tableau automatiquement
    ];
}
