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
        Schema::create('conges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultant_id')->constrained('consultants')->cascadeOnDelete();
            $table->date('start_date'); // Date de début du congé
            $table->date('end_date'); // Date de fin du congé
            $table->foreignId('leave_type_id')->nullable()->constrained('leave_types')->nullOnDelete();
            $table->text('reason')->nullable(); // Motif/raison du congé
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Statut: en attente, approuvé, refusé
            $table->foreignId('rh_id')->nullable()->constrained('rh')->nullOnDelete(); // RH qui a traité la demande
            $table->text('rh_comment')->nullable(); // Commentaire du RH
            $table->timestamp('processed_at')->nullable(); // Date de traitement par le RH
            $table->timestamps();
            
            // Index pour améliorer les performances
            $table->index('consultant_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conges');
    }
};
