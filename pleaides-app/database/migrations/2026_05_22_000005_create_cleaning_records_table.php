<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->date('cleaning_date');
            $table->foreignId('performed_by_group_id')->constrained('shift_groups');
            $table->string('performed_by_leader');
            $table->foreignId('started_by_group_id')->constrained('shift_groups');
            $table->string('started_by_leader');
            $table->unsignedInteger('duration_since_last')->nullable();
            $table->date('next_due_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaning_records');
    }
};
