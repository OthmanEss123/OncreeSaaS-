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
        Schema::create('schedule_contests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained('consultants')->cascadeOnDelete();
            $table->foreignId('work_schedule_id')->constrained('work_schedules')->cascadeOnDelete();
            $table->text('justification');
            $table->enum('status', ['pending', 'resolved', 'rejected'])->default('pending');
            $table->timestamps();
            
            // Index pour améliorer les performances des requêtes
            $table->index('client_id');
            $table->index('consultant_id');
            $table->index('work_schedule_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_contests');
    }
};
