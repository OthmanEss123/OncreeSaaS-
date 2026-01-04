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
        Schema::create('user_signatures', function (Blueprint $table) {
            $table->id();
            
            // Type d'utilisateur et ID (polymorphique)
            $table->string('user_type')->comment('Consultant, Client, Manager, Rh, Comptable');
            $table->unsignedBigInteger('user_id')->comment('ID de l\'utilisateur au moment de la signature');
            
            // Informations de l'utilisateur au moment de la signature (dénormalisées)
            $table->string('user_name')->comment('Nom de l\'utilisateur au moment de la signature');
            $table->string('user_email')->comment('Email de l\'utilisateur au moment de la signature');
            
            // Signature
            $table->text('signature_data')->comment('Signature en base64');
            $table->timestamp('signed_at')->useCurrent();
            
            // Contexte de la signature
            $table->string('document_type')->nullable()->comment('Type de document: CRA, CONTRACT, FORM, etc.');
            $table->unsignedBigInteger('document_id')->nullable()->comment('ID du document associé');
            $table->json('metadata')->nullable()->comment('Métadonnées supplémentaires (IP, navigateur, etc.)');
            
            // Relations optionnelles (pour référence, mais pas pour affichage)
            $table->unsignedBigInteger('consultant_id')->nullable()->comment('Si c\'est lié à un consultant');
            $table->unsignedBigInteger('client_id')->nullable()->comment('Si c\'est lié à un client');
            $table->unsignedBigInteger('manager_id')->nullable()->comment('Si c\'est lié à un manager');
            
            // Pour les CRA spécifiquement
            $table->integer('month')->nullable()->comment('Mois pour les CRA');
            $table->integer('year')->nullable()->comment('Année pour les CRA');
            
            $table->timestamps();
            
            // Index pour performances
            $table->index(['user_type', 'user_id']);
            $table->index(['document_type', 'document_id']);
            $table->index(['consultant_id', 'month', 'year']);
            $table->index('signed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_signatures');
    }
};
