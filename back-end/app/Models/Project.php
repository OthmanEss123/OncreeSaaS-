<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['client_id','name','description','start_date','end_date'];

    public function client()     { return $this->belongsTo(Client::class); }
    public function assignments(){ return $this->hasMany(Assignment::class); }
    public function quotes()     { return $this->hasMany(Quote::class); }
    public function consultants() { return $this->hasMany(Consultant::class); }
}
