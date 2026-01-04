<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['client_id','name','description','start_date','end_date','id_manager','id_comptable','id_rh'];

    public function client()     { return $this->belongsTo(Client::class); }
    public function manager()    { return $this->belongsTo(Manager::class, 'id_manager'); }
    public function comptable()  { return $this->belongsTo(Comptable::class, 'id_comptable'); }
    public function rh()         { return $this->belongsTo(Rh::class, 'id_rh'); }
    public function assignments(){ return $this->hasMany(Assignment::class); }
    public function quotes()     { return $this->hasMany(Quote::class); }
    public function consultants() { return $this->hasMany(Consultant::class); }
}
