<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('weaving_calculations', function (Blueprint $table) {
            $table->foreignId('tube_type_id')->nullable()->after('machine_id')->constrained('tube_types')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('weaving_calculations', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\TubeType::class);
            $table->dropColumn('tube_type_id');
        });
    }
};
