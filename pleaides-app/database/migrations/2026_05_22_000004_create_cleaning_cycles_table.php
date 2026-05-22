<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_cycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_id')->constrained('machine_types')->cascadeOnDelete();
            $table->unsignedInteger('frequency_value');
            $table->enum('frequency_unit', ['days', 'weeks'])->default('days');
            $table->text('cleaning_steps')->nullable();
            $table->date('effective_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaning_cycles');
    }
};
