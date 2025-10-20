<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->decimal('amount',10,2);
            $table->enum('status',['draft','sent','accepted','rejected'])->default('draft');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};


















