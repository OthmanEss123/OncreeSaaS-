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
            // Ajouter le champ period pour différencier matin et soir (si il n'existe pas déjà)
            if (!Schema::hasColumn('work_schedules', 'period')) {
                $table->enum('period', ['morning', 'evening'])->default('morning')->after('date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Supprimer le champ period
            $table->dropColumn('period');
        });
    }
};
