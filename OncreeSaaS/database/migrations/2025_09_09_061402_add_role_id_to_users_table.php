<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Il est possible qu'elle ait été ajoutée avant, nous vérifions
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable()->after('password');

                // Nous ajoutons la contrainte si les rôles existent
                if (Schema::hasTable('roles')) {
                    $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role_id')) {
                // Nous essayons de supprimer la FK si elle existe
                try { $table->dropForeign(['role_id']); } catch (\Throwable $e) {}
                $table->dropColumn('role_id');
            }
        });
    }
};

