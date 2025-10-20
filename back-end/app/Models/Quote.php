<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = ['client_id','project_id','amount','status'];

    public function client() { return $this->belongsTo(Client::class); }
    public function project(){ return $this->belongsTo(Project::class); }
    public function factures(){ return $this->hasMany(Facture::class); }
}
