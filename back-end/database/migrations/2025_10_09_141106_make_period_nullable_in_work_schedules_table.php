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
            // Modifier la colonne period pour accepter NULL
            $table->enum('period', ['morning', 'evening'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Remettre la colonne period comme non-nullable
            $table->enum('period', ['morning', 'evening'])->default('morning')->change();
        });
    }
};
