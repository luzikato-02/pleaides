<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weaving_calculations', function (Blueprint $table) {
            $table->id();

            // Job info
            $table->foreignId('shift_group_id')->nullable()->constrained('shift_groups')->nullOnDelete();
            $table->string('shift_period')->nullable();
            $table->string('production_order')->nullable();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->string('weaving_style')->nullable();
            $table->decimal('twisting_length', 10, 2)->nullable();

            // Creel parameters
            $table->decimal('total_rolls', 10, 2)->nullable();
            $table->decimal('total_roll_produced', 10, 2)->nullable();
            $table->decimal('total_warp_ends', 10, 2)->nullable();
            $table->decimal('plastic_tube_weight', 10, 3)->nullable();
            $table->decimal('standard_roll_length', 10, 2)->nullable();
            $table->decimal('adjustment_length', 10, 2)->nullable();
            $table->decimal('gpm_1', 10, 3)->nullable();
            $table->decimal('gpm_2', 10, 3)->nullable();

            // Bobbin weight samples
            $table->decimal('ao_sample_1', 10, 2)->nullable();
            $table->decimal('ao_sample_2', 10, 2)->nullable();
            $table->decimal('ai_sample_1', 10, 2)->nullable();
            $table->decimal('ai_sample_2', 10, 2)->nullable();
            $table->decimal('ai_sample_3', 10, 2)->nullable();
            $table->decimal('ai_sample_4', 10, 2)->nullable();
            $table->decimal('bi_sample_1', 10, 2)->nullable();
            $table->decimal('bi_sample_2', 10, 2)->nullable();
            $table->decimal('bi_sample_3', 10, 2)->nullable();
            $table->decimal('bi_sample_4', 10, 2)->nullable();
            $table->decimal('bo_sample_1', 10, 2)->nullable();
            $table->decimal('bo_sample_2', 10, 2)->nullable();

            // Machine standard snapshots (preserve historical accuracy)
            $table->decimal('standard_creel_length_snapshot', 10, 3)->nullable();
            $table->decimal('quality_factor_snapshot', 8, 4)->nullable();

            // Computed results
            $table->decimal('actual_length', 10, 2)->nullable();
            $table->decimal('actual_gpm', 10, 3)->nullable();
            $table->decimal('min_required_bobbin_weight', 10, 2)->nullable();
            $table->decimal('avg_bobbin_weight', 10, 2)->nullable();
            $table->decimal('waste_estimate_kg', 10, 3)->nullable();
            $table->decimal('standard_waste_kg', 10, 3)->nullable();
            $table->string('roll_status')->nullable(); // sufficient | short | pending
            $table->string('waste_status')->nullable(); // within | excess | no-data

            $table->timestamp('calculated_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weaving_calculations');
    }
};
