<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->foreignId('production_area_id')
                ->nullable()
                ->after('type_id')
                ->constrained('production_areas')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\ProductionArea::class);
            $table->dropColumn('production_area_id');
        });
    }
};
