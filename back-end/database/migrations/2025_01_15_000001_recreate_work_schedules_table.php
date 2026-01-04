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
        if (Schema::hasTable('work_schedules')) {
            // La table existe déjà, on ne fait rien
            return;
        }

        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultant_id')->constrained('consultants')->cascadeOnDelete();
            $table->date('date');
            $table->enum('type', ['workday', 'weekend', 'vacation'])->nullable();
            $table->decimal('days_worked', 3, 1)->default(0); // 3 chiffres, 1 décimale (ex: 1.5 jours)
            $table->boolean('weekend_worked')->default(false); // Si c'est un weekend travaillé
            $table->enum('absence_type', ['none', 'vacation', 'sick', 'personal', 'other'])->default('none');
            $table->decimal('absence_days', 3, 1)->default(0); // Nombre de jours d'absence
            $table->integer('month')->nullable(); // Mois (1-12)
            $table->integer('year')->nullable(); // Année
            $table->foreignId('work_type_id')->nullable()->constrained('work_types')->onDelete('set null');
            $table->foreignId('leave_type_id')->nullable()->constrained('leave_types')->onDelete('set null');
            $table->decimal('work_type_days', 3, 1)->default(0); // Jours de type de travail
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Contrainte unique pour éviter les doublons
            $table->unique(['consultant_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};


