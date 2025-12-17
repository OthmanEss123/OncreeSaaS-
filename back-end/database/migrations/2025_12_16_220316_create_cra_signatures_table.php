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
        Schema::create('cra_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultant_id')->constrained('consultants')->onDelete('cascade');
            $table->integer('month')->comment('Mois (1-12)');
            $table->integer('year')->comment('Année');
            $table->text('signature_data')->comment('Signature en base64');
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
            
            // Index unique pour éviter les doublons
            $table->unique(['consultant_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cra_signatures');
    }
};
