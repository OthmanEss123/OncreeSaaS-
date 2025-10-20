<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id','consultant_id','quote_id',
        'created_by_manager','facture_date','due_date','status','total'
    ];

    public function client()    { return $this->belongsTo(Client::class); }
    public function consultant(){ return $this->belongsTo(Consultant::class); }
    public function quote()     { return $this->belongsTo(Quote::class); }
    public function manager()   { return $this->belongsTo(Manager::class,'created_by_manager'); }
    public function items()     { return $this->hasMany(FactureItem::class); }
}
