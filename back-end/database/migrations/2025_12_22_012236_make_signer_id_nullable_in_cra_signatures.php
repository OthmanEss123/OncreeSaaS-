<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Rendre signer_id et signer_type nullable car ils ne sont plus utilisés
     */
    public function up(): void
    {
        if (Schema::hasColumn('cra_signatures', 'signer_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->unsignedBigInteger('signer_id')->nullable()->change();
            });
        }
        
        if (Schema::hasColumn('cra_signatures', 'signer_type')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->string('signer_type')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('cra_signatures', 'signer_id')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->unsignedBigInteger('signer_id')->nullable(false)->change();
            });
        }
        
        if (Schema::hasColumn('cra_signatures', 'signer_type')) {
            Schema::table('cra_signatures', function (Blueprint $table) {
                $table->string('signer_type')->nullable(false)->change();
            });
        }
    }
};
