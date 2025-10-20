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
            // Ajouter les clés étrangères pour les types
            $table->foreignId('work_type_id')->nullable()->constrained('work_types')->onDelete('set null');
            $table->foreignId('leave_type_id')->nullable()->constrained('leave_types')->onDelete('set null');
            
            // Modifier les colonnes existantes pour utiliser les nouvelles relations
            // On garde les anciennes colonnes pour la compatibilité mais on peut les rendre nullable
            $table->string('type')->nullable()->change();
            $table->string('absence_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_schedules', function (Blueprint $table) {
            // Supprimer les clés étrangères
            $table->dropForeign(['work_type_id']);
            $table->dropForeign(['leave_type_id']);
            
            // Supprimer les colonnes
            $table->dropColumn(['work_type_id', 'leave_type_id']);
            
            // Restaurer les colonnes originales
            $table->string('type')->nullable(false)->change();
            $table->string('absence_type')->nullable(false)->change();
        });
    }
};
