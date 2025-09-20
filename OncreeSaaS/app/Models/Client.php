<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    protected $fillable = ['company_name', 'contact_name', 'email', 'phone', 'address'];

    public function missions()
    {
        return $this->hasMany(Mission::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}