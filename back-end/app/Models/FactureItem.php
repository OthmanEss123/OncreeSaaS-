<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FactureItem extends Model
{
    use HasFactory;

    protected $fillable = ['facture_id','description','quantity','unit_price'];

    public function facture() { return $this->belongsTo(Facture::class); }
}
