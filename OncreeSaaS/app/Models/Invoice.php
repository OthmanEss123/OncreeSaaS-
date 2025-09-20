<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'mission_id', 'amount', 'status', 'due_date', 'pdf_path'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
