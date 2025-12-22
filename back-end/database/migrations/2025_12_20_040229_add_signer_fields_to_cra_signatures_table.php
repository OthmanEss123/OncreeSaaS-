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
        // Vérifier si les colonnes n'existent pas déjà
        if (!Schema::hasColumn('cra_signatures', 'signer_type')) {
            // Supprimer l'ancien index unique s'il existe (en utilisant raw SQL)
            $connection = DB::connection();
            $databaseName = $connection->getDatabaseName();
            
            // Vérifier et supprimer l'ancien index unique s'il existe
            $indexes = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name != 'PRIMARY'");
            foreach ($indexes as $index) {
                if ($index->Non_unique == 0) {
                    // C'est un index unique, vérifier s'il contient les colonnes consultant_id, month, year
                    $indexColumns = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name = ?", [$index->Key_name]);
                    $columnNames = array_column($indexColumns, 'Column_name');
                    
                    if (in_array('consultant_id', $columnNames) && 
                        in_array('month', $columnNames) && 
                        in_array('year', $columnNames) &&
                        !in_array('signer_type', $columnNames)) {
                        // C'est l'ancien index unique, le supprimer
                        DB::statement("ALTER TABLE `cra_signatures` DROP INDEX `{$index->Key_name}`");
                        break;
                    }
                }
            }
            
            Schema::table('cra_signatures', function (Blueprint $table) {
                // Ajouter les nouvelles colonnes
                $table->enum('signer_type', ['consultant', 'client', 'manager'])->default('consultant')->after('consultant_id');
                $table->unsignedBigInteger('signer_id')->after('signer_type');
                
                // Créer un nouveau index unique qui inclut le type de signataire
                // Cela permet d'avoir une signature par type (consultant, client, manager) pour le même CRA
                $table->unique(['consultant_id', 'month', 'year', 'signer_type'], 'cra_signatures_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cra_signatures', function (Blueprint $table) {
            // Supprimer le nouvel index unique
            $table->dropUnique('cra_signatures_unique');
            
            // Supprimer les colonnes ajoutées
            $table->dropColumn(['signer_type', 'signer_id']);
            
            // Restaurer l'ancien index unique
            $table->unique(['consultant_id', 'month', 'year']);
        });
    }
};
