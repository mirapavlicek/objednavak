<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_block_doctors', function (Blueprint $table) {
            $table->foreignId('procedure_block_id')->constrained('procedure_blocks')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->primary(['procedure_block_id', 'doctor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_block_doctors');
    }
};
