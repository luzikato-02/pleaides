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
            $table->decimal('body_tension', 10, 3)->nullable()->after('weaving_style');
        });
    }

    public function down(): void
    {
        Schema::table('weaving_calculations', function (Blueprint $table) {
            $table->dropColumn('body_tension');
        });
    }
};
