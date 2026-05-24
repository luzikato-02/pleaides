<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weaving_calculations', function (Blueprint $table) {
            $table->decimal('adjustment_length_2', 10, 3)->nullable()->after('adjustment_length');
            $table->decimal('total_roll_produced_2', 10, 0)->nullable()->after('adjustment_length_2');
            $table->decimal('adjustment_length_3', 10, 3)->nullable()->after('total_roll_produced_2');
            $table->decimal('total_roll_produced_3', 10, 0)->nullable()->after('adjustment_length_3');
        });
    }

    public function down(): void
    {
        Schema::table('weaving_calculations', function (Blueprint $table) {
            $table->dropColumn(['adjustment_length_2', 'total_roll_produced_2', 'adjustment_length_3', 'total_roll_produced_3']);
        });
    }
};
