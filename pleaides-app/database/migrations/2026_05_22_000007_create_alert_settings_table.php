<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('warning_window_days')->default(3);
            $table->string('send_time', 5)->default('07:00');
            $table->boolean('daily_re_alert')->default(true);
            $table->timestamps();
        });

        // Seed the single settings row
        DB::table('alert_settings')->insert([
            'warning_window_days' => 3,
            'send_time' => '07:00',
            'daily_re_alert' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_settings');
    }
};
