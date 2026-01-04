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
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('id_manager')->nullable()->constrained('managers')->onDelete('set null');
            $table->foreignId('id_comptable')->nullable()->constrained('comptables')->onDelete('set null');
            $table->foreignId('id_rh')->nullable()->constrained('rh')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['id_manager']);
            $table->dropForeign(['id_comptable']);
            $table->dropForeign(['id_rh']);
            $table->dropColumn(['id_manager', 'id_comptable', 'id_rh']);
        });
    }
};
