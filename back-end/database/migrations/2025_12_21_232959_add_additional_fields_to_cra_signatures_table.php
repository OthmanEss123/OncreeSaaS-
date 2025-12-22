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
        // Vérifier si les colonnes n'existent pas déjà avant de les ajouter
        if (!Schema::hasColumn('cra_signatures', 'work_schedule_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->foreignId('work_schedule_id')->nullable()->after('consultant_id')->constrained('work_schedules')->onDelete('set null');
            });
        }
        
        if (!Schema::hasColumn('cra_signatures', 'client_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->foreignId('client_id')->nullable()->after('work_schedule_id')->constrained('clients')->onDelete('set null');
            });
        }
        
        if (!Schema::hasColumn('cra_signatures', 'manager_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->foreignId('manager_id')->nullable()->after('client_id')->constrained('managers')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cra_signatures', function (Blueprint $table) {
            if (Schema::hasColumn('cra_signatures', 'manager_id')) {
                $table->dropForeign(['manager_id']);
                $table->dropColumn('manager_id');
            }
            if (Schema::hasColumn('cra_signatures', 'client_id')) {
                $table->dropForeign(['client_id']);
                $table->dropColumn('client_id');
            }
            if (Schema::hasColumn('cra_signatures', 'work_schedule_id')) {
                $table->dropForeign(['work_schedule_id']);
                $table->dropColumn('work_schedule_id');
            }
        });
    }
};
