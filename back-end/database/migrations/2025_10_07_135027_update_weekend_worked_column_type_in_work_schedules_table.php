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
            // Changer le type de weekend_worked de boolean à decimal pour stocker le nombre de jours
            $table->decimal('weekend_worked', 3, 1)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Revenir au type boolean pour weekend_worked
            $table->boolean('weekend_worked')->default(false)->change();
        });
    }
};
