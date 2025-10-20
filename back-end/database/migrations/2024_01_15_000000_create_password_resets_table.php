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
        Schema::create('password_resets', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code', 6); // 6-digit code
            $table->string('user_type'); // client, manager, rh, comptable, consultant
            $table->timestamp('created_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            // Index for faster lookups
            $table->index(['email', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_resets');
    }
};














