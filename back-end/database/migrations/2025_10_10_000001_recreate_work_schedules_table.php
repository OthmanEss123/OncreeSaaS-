<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    // Drop foreign key constraint from schedule_contests if it exists
    if (Schema::hasTable('schedule_contests')) {
        try {
            Schema::table('schedule_contests', function (Blueprint $table) {
                $table->dropForeign(['work_schedule_id']);
            });
        } catch (\Exception $e) {
            // If that fails, try dropping by MySQL auto-generated constraint name
            try {
                DB::statement('ALTER TABLE `schedule_contests` DROP FOREIGN KEY `schedule_contests_ibfk_3`');
            } catch (\Exception $e2) {
                // Constraint might not exist, continue
            }
        }
    }
    
    // Drop foreign key constraint from cra_signatures if it exists
    if (Schema::hasTable('cra_signatures')) {
        try {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->dropForeign(['work_schedule_id']);
            });
        } catch (\Exception $e) {
            // Constraint might not exist, continue
        }
    }
    
    // Drop and recreate work_schedules table
    Schema::dropIfExists('work_schedules');
    
    Schema::create('work_schedules', function (Blueprint $table) {
        $table->id();
        $table->foreignId('consultant_id')->constrained('consultants')->cascadeOnDelete();
        $table->date('date');
        $table->enum('period', ['morning', 'evening'])->default('morning');
        $table->enum('type', ['workday', 'weekend', 'vacation'])->nullable();
        $table->decimal('days_worked', 3, 1)->default(0);
        $table->boolean('weekend_worked')->default(false);
        $table->enum('absence_type', ['none', 'vacation', 'sick', 'personal', 'other'])->default('none');
        $table->decimal('absence_days', 3, 1)->default(0);
        $table->integer('month')->nullable();
        $table->integer('year')->nullable();
        $table->foreignId('work_type_id')->nullable()->constrained('work_types')->onDelete('set null');
        $table->foreignId('leave_type_id')->nullable()->constrained('leave_types')->onDelete('set null');
        $table->decimal('work_type_days', 3, 1)->default(0);
        $table->text('notes')->nullable();
        $table->timestamps();
        
        $table->unique(['consultant_id', 'date', 'period'], 'work_schedules_consultant_date_period_unique');
    });
    
    // Re-add foreign key constraint to schedule_contests if it exists
    if (Schema::hasTable('schedule_contests')) {
        Schema::table('schedule_contests', function (Blueprint $table) {
            $table->foreign('work_schedule_id')->references('id')->on('work_schedules')->onDelete('cascade');
        });
    }
    
    // Re-add foreign key constraint to cra_signatures if it exists
    if (Schema::hasTable('cra_signatures')) {
        Schema::table('cra_signatures', function (Blueprint $table) {
            $table->foreign('work_schedule_id')->references('id')->on('work_schedules')->onDelete('set null');
        });
    }
}
};
