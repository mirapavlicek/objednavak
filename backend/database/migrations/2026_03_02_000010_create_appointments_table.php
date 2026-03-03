<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pet_id')->nullable()->constrained()->nullOnDelete();
            $table->string('manual_name')->nullable();
            $table->string('manual_phone', 20)->nullable();
            $table->string('manual_pet')->nullable();
            $table->string('procedure_id', 30);
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->time('time');
            $table->unsignedSmallInteger('duration');
            $table->string('status', 20)->default('pending');
            $table->text('note')->nullable();
            $table->string('created_by', 20)->default('reception');
            $table->time('arrival_time')->nullable();
            $table->timestamps();

            $table->foreign('procedure_id')->references('id')->on('procedures');
            $table->index(['date', 'status']);
            $table->index(['doctor_id', 'date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
