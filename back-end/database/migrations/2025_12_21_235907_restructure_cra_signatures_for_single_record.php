<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Restructure la table pour avoir un seul enregistrement par consultant/mois/année
     * avec des colonnes séparées pour chaque type de signature
     */
    public function up(): void
    {
        // Ajouter les nouvelles colonnes pour chaque type de signature
        if (!Schema::hasColumn('cra_signatures', 'consultant_signature_data')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->text('consultant_signature_data')->nullable()->after('signature_data')->comment('Signature du consultant en base64');
                $table->timestamp('consultant_signed_at')->nullable()->after('consultant_signature_data');
                $table->unsignedBigInteger('consultant_signer_id')->nullable()->after('consultant_signed_at');
            });
        }
        
        if (!Schema::hasColumn('cra_signatures', 'client_signature_data')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->text('client_signature_data')->nullable()->after('consultant_signer_id')->comment('Signature du client en base64');
                $table->timestamp('client_signed_at')->nullable()->after('client_signature_data');
                $table->unsignedBigInteger('client_signer_id')->nullable()->after('client_signed_at');
            });
        }
        
        if (!Schema::hasColumn('cra_signatures', 'manager_signature_data')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->text('manager_signature_data')->nullable()->after('client_signer_id')->comment('Signature du manager en base64');
                $table->timestamp('manager_signed_at')->nullable()->after('manager_signature_data');
                $table->unsignedBigInteger('manager_signer_id')->nullable()->after('manager_signed_at');
            });
        }

        // Migrer les données existantes si elles existent
        $this->migrateExistingData();

        // Supprimer l'ancienne contrainte unique avec signer_type
        $indexes = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name != 'PRIMARY'");
        foreach ($indexes as $index) {
            if ($index->Non_unique == 0) {
                $indexColumns = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name = ?", [$index->Key_name]);
                $columnNames = array_column($indexColumns, 'Column_name');
                
                // Si la contrainte contient signer_type, la supprimer
                if (in_array('signer_type', $columnNames)) {
                    try {
                        DB::statement("ALTER TABLE `cra_signatures` DROP INDEX `{$index->Key_name}`");
                    } catch (\Exception $e) {
                        // Ignorer si l'index n'existe pas
                    }
                }
            }
        }

        // Créer une nouvelle contrainte unique sans signer_type (un seul enregistrement par consultant/mois/année)
        if (!Schema::hasColumn('cra_signatures', 'consultant_id') || 
            !Schema::hasColumn('cra_signatures', 'month') || 
            !Schema::hasColumn('cra_signatures', 'year')) {
            return; // Les colonnes n'existent pas, on ne peut pas créer la contrainte
        }

        // Vérifier si la contrainte existe déjà
        $hasConstraint = false;
        $allIndexes = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name != 'PRIMARY'");
        foreach ($allIndexes as $idx) {
            if ($idx->Non_unique == 0) {
                $idxColumns = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name = ?", [$idx->Key_name]);
                $colNames = array_column($idxColumns, 'Column_name');
                if (in_array('consultant_id', $colNames) && 
                    in_array('month', $colNames) && 
                    in_array('year', $colNames) &&
                    !in_array('signer_type', $colNames)) {
                    $hasConstraint = true;
                    break;
                }
            }
        }

        if (!$hasConstraint) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                try {
                    $table->unique(['consultant_id', 'month', 'year'], 'cra_signatures_consultant_month_year_unique');
                } catch (\Exception $e) {
                    // La contrainte existe peut-être déjà avec un autre nom
                }
            });
        }
    }

    /**
     * Migrer les données existantes vers la nouvelle structure
     */
    private function migrateExistingData(): void
    {
        // Récupérer tous les enregistrements groupés par consultant_id, month, year
        $groupedSignatures = DB::table('cra_signatures')
            ->select('consultant_id', 'month', 'year')
            ->groupBy('consultant_id', 'month', 'year')
            ->get();

        foreach ($groupedSignatures as $group) {
            // Récupérer toutes les signatures pour ce groupe
            $signatures = DB::table('cra_signatures')
                ->where('consultant_id', $group->consultant_id)
                ->where('month', $group->month)
                ->where('year', $group->year)
                ->get();

            if ($signatures->count() <= 1) {
                continue; // Pas besoin de migration si un seul enregistrement
            }

            // Créer ou mettre à jour un seul enregistrement avec toutes les signatures
            $firstSignature = $signatures->first();
            
            $updateData = [];
            foreach ($signatures as $sig) {
                $signerType = $sig->signer_type ?? 'consultant';
                
                if ($signerType === 'consultant') {
                    $updateData['consultant_signature_data'] = $sig->signature_data;
                    $updateData['consultant_signed_at'] = $sig->signed_at;
                    $updateData['consultant_signer_id'] = $sig->signer_id;
                } elseif ($signerType === 'client') {
                    $updateData['client_signature_data'] = $sig->signature_data;
                    $updateData['client_signed_at'] = $sig->signed_at;
                    $updateData['client_signer_id'] = $sig->signer_id;
                } elseif ($signerType === 'manager') {
                    $updateData['manager_signature_data'] = $sig->signature_data;
                    $updateData['manager_signed_at'] = $sig->signed_at;
                    $updateData['manager_signer_id'] = $sig->signer_id;
                }
            }

            // Mettre à jour le premier enregistrement
            DB::table('cra_signatures')
                ->where('id', $firstSignature->id)
                ->update($updateData);

            // Supprimer les autres enregistrements dupliqués
            $idsToDelete = $signatures->where('id', '!=', $firstSignature->id)->pluck('id');
            if ($idsToDelete->isNotEmpty()) {
                DB::table('cra_signatures')->whereIn('id', $idsToDelete)->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les nouvelles colonnes
        if (Schema::hasColumn('cra_signatures', 'manager_signer_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->dropColumn([
                    'manager_signer_id',
                    'manager_signed_at',
                    'manager_signature_data'
                ]);
            });
        }
        
        if (Schema::hasColumn('cra_signatures', 'client_signer_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->dropColumn([
                    'client_signer_id',
                    'client_signed_at',
                    'client_signature_data'
                ]);
            });
        }
        
        if (Schema::hasColumn('cra_signatures', 'consultant_signer_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->dropColumn([
                    'consultant_signer_id',
                    'consultant_signed_at',
                    'consultant_signature_data'
                ]);
            });
        }

        // Restaurer l'ancienne contrainte unique avec signer_type
        Schema::table('cra_signatures', function (Blueprint $table) {
            // Supprimer la contrainte sans signer_type
            try {
                $table->dropUnique('cra_signatures_consultant_month_year_unique');
            } catch (\Exception $e) {
                // Ignorer si la contrainte n'existe pas
            }
            
            // Recréer la contrainte avec signer_type si la colonne existe
            if (Schema::hasColumn('cra_signatures', 'signer_type')) {
                try {
                    $table->unique(['consultant_id', 'month', 'year', 'signer_type'], 'cra_signatures_unique');
                } catch (\Exception $e) {
                    // Ignorer si la contrainte existe déjà
                }
            }
        });
    }
};
