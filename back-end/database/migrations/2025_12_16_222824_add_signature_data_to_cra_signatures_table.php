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
        Schema::table('cra_signatures', function (Blueprint $table) {
            // Vérifier si les colonnes n'existent pas déjà avant de les ajouter
            if (!Schema::hasColumn('cra_signatures', 'consultant_id')) {
                $table->foreignId('consultant_id')->constrained('consultants')->onDelete('cascade');
            }
            if (!Schema::hasColumn('cra_signatures', 'month')) {
                $table->integer('month')->comment('Mois (1-12)');
            }
            if (!Schema::hasColumn('cra_signatures', 'year')) {
                $table->integer('year')->comment('Année');
            }
            if (!Schema::hasColumn('cra_signatures', 'signature_data')) {
                $table->text('signature_data')->comment('Signature en base64');
            }
            if (!Schema::hasColumn('cra_signatures', 'signed_at')) {
                $table->timestamp('signed_at')->nullable();
            }
            
            // Ajouter l'index unique s'il n'existe pas (seulement si toutes les colonnes existent)
            if (Schema::hasColumn('cra_signatures', 'consultant_id') && 
                Schema::hasColumn('cra_signatures', 'month') && 
                Schema::hasColumn('cra_signatures', 'year')) {
                try {
                    $table->unique(['consultant_id', 'month', 'year'], 'cra_signatures_consultant_id_month_year_unique');
                } catch (\Exception $e) {
                    // L'index existe déjà, on ignore l'erreur
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cra_signatures', function (Blueprint $table) {
            //
        });
    }
};
