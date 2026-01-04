<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
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
            $table->enum('type',['workday','weekend','vacation']);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['consultant_id','date']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};


















