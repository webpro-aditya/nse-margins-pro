<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nse_api_logs', function (Blueprint $table) {
            $table->id();
            $table->string('segment');
            $table->string('endpoint');
            $table->string('msg_id')->nullable();
            $table->json('request_payload')->nullable();
            $table->integer('response_status')->nullable();
            $table->json('response_data')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nse_api_logs');
    }
};
