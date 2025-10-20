<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facture_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity',8,2)->default(1);
            $table->decimal('unit_price',10,2);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('facture_items');
    }
};


















