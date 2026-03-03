<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_block_categories', function (Blueprint $table) {
            $table->foreignId('procedure_block_id')->constrained('procedure_blocks')->cascadeOnDelete();
            $table->string('category', 30);
            $table->primary(['procedure_block_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_block_categories');
    }
};
