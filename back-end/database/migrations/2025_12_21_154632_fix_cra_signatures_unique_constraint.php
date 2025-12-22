<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drop all old unique constraints that don't include signer_type
     * and ensure the new constraint with signer_type exists
     */
    public function up(): void
    {
        // Get all unique indexes on cra_signatures table
        $indexes = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name != 'PRIMARY'");
        
        $uniqueIndexes = [];
        foreach ($indexes as $index) {
            if ($index->Non_unique == 0) {
                $uniqueIndexes[$index->Key_name] = [];
            }
        }
        
        // Get columns for each unique index
        foreach ($uniqueIndexes as $indexName => &$columns) {
            $indexColumns = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name = ?", [$indexName]);
            $columns = array_column($indexColumns, 'Column_name');
        }
        
        // Drop all unique constraints that don't include signer_type
        foreach ($uniqueIndexes as $indexName => $columns) {
            if (in_array('consultant_id', $columns) && 
                in_array('month', $columns) && 
                in_array('year', $columns) &&
                !in_array('signer_type', $columns)) {
                // This is an old constraint, drop it
                try {
                    DB::statement("ALTER TABLE `cra_signatures` DROP INDEX `{$indexName}`");
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            }
        }
        
        // Ensure the new constraint exists (only if signer_type column exists)
        if (Schema::hasColumn('cra_signatures', 'signer_type')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                // Check if the new constraint already exists
                $hasNewConstraint = false;
                $allIndexes = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name != 'PRIMARY'");
                foreach ($allIndexes as $idx) {
                    if ($idx->Non_unique == 0) {
                        $idxColumns = DB::select("SHOW INDEXES FROM `cra_signatures` WHERE Key_name = ?", [$idx->Key_name]);
                        $colNames = array_column($idxColumns, 'Column_name');
                        if (in_array('consultant_id', $colNames) && 
                            in_array('month', $colNames) && 
                            in_array('year', $colNames) &&
                            in_array('signer_type', $colNames)) {
                            $hasNewConstraint = true;
                            break;
                        }
                    }
                }
                
                // Create the new constraint if it doesn't exist
                if (!$hasNewConstraint) {
                    try {
                        $table->unique(['consultant_id', 'month', 'year', 'signer_type'], 'cra_signatures_unique');
                    } catch (\Exception $e) {
                        // Constraint might already exist with a different name
                    }
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is idempotent and safe to run multiple times
        // No need to reverse it
    }
};
