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
        Schema::table('work_schedules', function (Blueprint $table) {
            // Vérifier et ajouter selected_days si elle n'existe pas
            if (!Schema::hasColumn('work_schedules', 'selected_days')) {
                $table->json('selected_days')->nullable()->after('notes');
            }
            
            // Vérifier et ajouter work_type_selected_days si elle n'existe pas
            if (!Schema::hasColumn('work_schedules', 'work_type_selected_days')) {
                $table->json('work_type_selected_days')->nullable()->after('selected_days');
            }
            
            // Vérifier et ajouter leave_type_selected_days si elle n'existe pas
            if (!Schema::hasColumn('work_schedules', 'leave_type_selected_days')) {
                $table->json('leave_type_selected_days')->nullable()->after('work_type_selected_days');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('work_schedules', 'selected_days')) {
                $table->dropColumn('selected_days');
            }
            if (Schema::hasColumn('work_schedules', 'work_type_selected_days')) {
                $table->dropColumn('work_type_selected_days');
            }
            if (Schema::hasColumn('work_schedules', 'leave_type_selected_days')) {
                $table->dropColumn('leave_type_selected_days');
            }
        });
    }
};

