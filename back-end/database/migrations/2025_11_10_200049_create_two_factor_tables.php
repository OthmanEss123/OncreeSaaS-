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
        Schema::create('two_factor_settings', function (Blueprint $table) {
            $table->id();
            $table->morphs('mfaable');
            $table->string('channel')->default('email');
            $table->boolean('enabled')->default(false);
            $table->string('secret')->nullable();
            $table->timestamps();
        });

        Schema::create('two_factor_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->morphs('mfaable');
            $table->string('code_hash');
            $table->string('channel');
            $table->timestamp('expires_at');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['mfaable_type', 'mfaable_id', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('two_factor_challenges');
        Schema::dropIfExists('two_factor_settings');
    }
};
