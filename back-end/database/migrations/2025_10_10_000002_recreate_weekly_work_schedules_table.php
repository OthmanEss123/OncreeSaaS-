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
    // Drop and recreate weekly_work_schedules table
    Schema::dropIfExists('weekly_work_schedules');
    
    Schema::create('weekly_work_schedules', function (Blueprint $table) {
        $table->id();
        $table->foreignId('consultant_id')->constrained('consultants')->cascadeOnDelete();
        $table->date('date');
        $table->string('period');
        $table->foreignId('work_type_id')->nullable()->constrained('work_types')->onDelete('set null');
        $table->foreignId('leave_type_id')->nullable()->constrained('leave_types')->onDelete('set null');
        $table->boolean('is_weekend')->default(false);
        $table->text('notes')->nullable();
        $table->decimal('travel_expenses', 10, 2)->default(0);
        $table->timestamps();
        
        // Index pour améliorer les performances
        $table->index(['consultant_id', 'date']);
        $table->index(['date', 'period']);
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_work_schedules');
    }
};


