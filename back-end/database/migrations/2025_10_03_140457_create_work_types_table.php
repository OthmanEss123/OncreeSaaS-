<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('work_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nom du type de travail (ex: "Temps plein", "Temps partiel", "Heures supplémentaires")
            $table->string('code')->unique(); // Code unique (ex: "FULL_TIME", "PART_TIME", "OVERTIME")
            $table->text('description')->nullable(); // Description détaillée
            $table->boolean('is_active')->default(true); // Actif ou non
            $table->decimal('multiplier', 3, 2)->default(1.00); // Multiplicateur de salaire (ex: 1.5 pour heures sup)
            $table->boolean('requires_approval')->default(false); // Nécessite une approbation
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_types');
    }
};
