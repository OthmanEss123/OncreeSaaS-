<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('comptables', function (Blueprint $table) {
            $table->id();
            $table->string('name',150);
            $table->string('email',150)->unique();
            $table->string('password');
            $table->string('phone',30)->nullable();
            $table->enum('role',['Comptable'])->default('Comptable');
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('comptables');
    }
};





