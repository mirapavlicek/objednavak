<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_specializations', function (Blueprint $table) {
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->string('category', 30);
            $table->primary(['doctor_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_specializations');
    }
};
