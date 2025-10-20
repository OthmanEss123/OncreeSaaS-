<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('consultants', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('client_id');
            $table->foreign('project_id')
                  ->references('id')->on('projects')
                  ->onDelete('set null'); // si le projet est supprimé, on garde le consultant sans projet
        });
    }

    public function down(): void
    {
        Schema::table('consultants', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });
    }
};
