<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('consultants', function (Blueprint $table) {
            if (!Schema::hasColumn('consultants', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
        });
    }
    public function down(): void {
        Schema::table('consultants', function (Blueprint $table) {
            if (Schema::hasColumn('consultants', 'address')) {
                $table->dropColumn('address');
            }
        });
    }
};
