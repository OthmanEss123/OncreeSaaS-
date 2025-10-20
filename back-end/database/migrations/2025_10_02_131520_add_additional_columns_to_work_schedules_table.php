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
            // Ajouter les colonnes pour les jours travaillés
            $table->decimal('days_worked', 3, 1)->default(0)->after('type'); // 3 chiffres, 1 décimale (ex: 1.5 jours)
            $table->boolean('weekend_worked')->default(false)->after('days_worked'); // Si c'est un weekend travaillé
            
            // Ajouter les colonnes pour les absences
            $table->enum('absence_type', ['none', 'vacation', 'sick', 'personal', 'other'])->default('none')->after('weekend_worked');
            $table->decimal('absence_days', 3, 1)->default(0)->after('absence_type'); // Nombre de jours d'absence
            
            // Ajouter le mois pour faciliter les requêtes
            $table->integer('month')->nullable()->after('date'); // Mois (1-12)
            $table->integer('year')->nullable()->after('month'); // Année
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Supprimer les colonnes ajoutées
            $table->dropColumn([
                'days_worked',
                'weekend_worked', 
                'absence_type',
                'absence_days',
                'month',
                'year'
            ]);
        });
    }
};
