<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weaving_machine_standards', function (Blueprint $table) {
            $table->decimal('quality_factor', 8, 4)->default(1.0)->after('standard_creel_length');
        });
    }

    public function down(): void
    {
        Schema::table('weaving_machine_standards', function (Blueprint $table) {
            $table->dropColumn('quality_factor');
        });
    }
};
