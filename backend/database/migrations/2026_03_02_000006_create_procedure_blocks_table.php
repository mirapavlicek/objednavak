<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->time('time_from');
            $table->time('time_to');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_blocks');
    }
};
