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
            // Ajouter la colonne workTypeDays pour compter les jours de type de travail
            $table->decimal('work_type_days', 3, 1)->default(0)->after('days_worked'); // 3 chiffres, 1 décimale (ex: 1.5 jours)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Supprimer la colonne work_type_days
            $table->dropColumn('work_type_days');
        });
    }
};
