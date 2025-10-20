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
        Schema::table('work_schedules', function (Blueprint $table) {
            // Colonne pour stocker les jours sélectionnés pour les types de travail
            $table->json('work_type_selected_days')->nullable()->after('selected_days')
                ->comment('Jours sélectionnés sur le calendrier pour les types de travail');
            
            // Colonne pour stocker les jours sélectionnés pour les congés
            $table->json('leave_type_selected_days')->nullable()->after('work_type_selected_days')
                ->comment('Jours sélectionnés sur le calendrier pour les congés');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            $table->dropColumn(['work_type_selected_days', 'leave_type_selected_days']);
        });
    }
};
