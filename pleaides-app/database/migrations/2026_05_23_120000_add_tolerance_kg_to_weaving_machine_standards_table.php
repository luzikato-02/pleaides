<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weaving_machine_standards', function (Blueprint $table) {
            $table->decimal('tolerance_kg', 10, 3)->nullable()->after('quality_factor');
        });
    }

    public function down(): void
    {
        Schema::table('weaving_machine_standards', function (Blueprint $table) {
            $table->dropColumn('tolerance_kg');
        });
    }
};
