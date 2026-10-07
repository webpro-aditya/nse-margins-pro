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
        Schema::create('nse_tokens', function (Blueprint $table) {
            $table->id();
            $table->text('access_token');
            $table->string('token_type', 50)->default('bearer');
            $table->integer('expires_in');
            $table->text('aes_secret_key');
            $table->text('aes_iv');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nse_tokens');
    }
};
