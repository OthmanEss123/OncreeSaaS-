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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nom du type de congé (ex: "Vacances", "Maladie", "Personnel")
            $table->string('code')->unique(); // Code unique (ex: "VACATION", "SICK", "PERSONAL")
            $table->text('description')->nullable(); // Description détaillée
            $table->boolean('is_active')->default(true); // Actif ou non
            $table->boolean('is_paid')->default(false); // Congé payé ou non
            $table->boolean('requires_approval')->default(true); // Nécessite une approbation
            $table->integer('max_days_per_year')->nullable(); // Nombre maximum de jours par an
            $table->boolean('requires_medical_certificate')->default(false); // Nécessite un certificat médical
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
