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
        Schema::create('settlement_margins', function (Blueprint $table) {
            $table->id();
            $table->string('tm_cp_code', 12)->index();
            $table->string('cli_code', 10)->index();
            $table->string('settlement_typ_no', 16)->index();
            $table->decimal('upfront_margin', 18, 2)->default(0);
            $table->decimal('icmtm', 18, 2)->default(0);
            $table->decimal('mtm_loss', 18, 2)->default(0);
            $table->decimal('buy_margin', 18, 2)->default(0);
            $table->decimal('sell_margin', 18, 2)->default(0);
            $table->decimal('lend_fee', 18, 2)->default(0);
            $table->decimal('total_margins', 18, 2)->default(0);
            $table->string('segment', 10)->default('CM');
            $table->date('margin_date')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlement_margins');
    }
};
