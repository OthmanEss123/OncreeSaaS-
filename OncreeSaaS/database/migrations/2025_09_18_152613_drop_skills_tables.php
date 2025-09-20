<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supprimer la table pivot si elle existe
        Schema::dropIfExists('consultant_skill');
        // Supprimer la table skills
        Schema::dropIfExists('skills');
    }

    public function down(): void
    {
        // Rien à recréer si tu ne veux plus de ces tables
    }
};
