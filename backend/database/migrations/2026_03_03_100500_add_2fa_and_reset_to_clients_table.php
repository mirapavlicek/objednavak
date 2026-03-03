<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('reset_code', 6)->nullable()->after('password_changed_at');
            $table->timestamp('reset_code_expires')->nullable()->after('reset_code');
            $table->string('two_factor_code', 6)->nullable()->after('reset_code_expires');
            $table->timestamp('two_factor_expires')->nullable()->after('two_factor_code');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['reset_code', 'reset_code_expires', 'two_factor_code', 'two_factor_expires']);
        });
    }
};
