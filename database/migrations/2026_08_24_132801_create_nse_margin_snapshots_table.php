<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nse_margin_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('segment');
            $table->string('type');
            $table->string('member_code');
            $table->json('data');
            $table->timestamp('api_timestamp')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nse_margin_snapshots');
    }
};
