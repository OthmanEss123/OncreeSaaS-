<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('company_name',150);
            $table->string('contact_name',150)->nullable();
            $table->string('contact_email',150)->unique();
            $table->string('contact_phone',50)->nullable();
            $table->enum('role',['Client'])->default('Client');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
