<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tube_types', function (Blueprint $table) {
            $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('basic_weight');
        });
    }

    public function down(): void
    {
        Schema::table('tube_types', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
