<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Projet extends Model
{
    use HasFactory;

    // Nom explicite de la table (facultatif si le pluriel est correct)
    protected $table = 'projets';

    // Colonnes autorisées en écriture
    protected $fillable = [
        'nom_projet',
        'email',
        'telephone',
        'nom_contacteur',
    ];
}
