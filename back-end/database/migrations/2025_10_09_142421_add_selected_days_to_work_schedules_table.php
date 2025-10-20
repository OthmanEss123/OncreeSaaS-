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
            // Ajouter une colonne JSON pour stocker les jours sélectionnés avec leurs périodes
            // Format: [{"date": "2025-09-01", "period": "morning"}, {"date": "2025-09-01", "period": "evening"}, ...]
            $table->json('selected_days')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            $table->dropColumn('selected_days');
        });
    }
};
