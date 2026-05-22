<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('machine_code')->unique();
            $table->string('machine_name');
            $table->foreignId('type_id')->constrained('machine_types')->cascadeOnDelete();
            $table->string('location')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Decommissioned'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
