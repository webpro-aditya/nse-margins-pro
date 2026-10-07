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
        Schema::create('tm_margins', function (Blueprint $table) {
            $table->id();
            $table->string('tm_cp_code', 12)->index();
            $table->string('tm_cp_name', 100)->nullable();
            $table->decimal('cash_collateral', 18, 2)->default(0);
            $table->decimal('non_cash_collateral', 18, 2)->default(0);
            $table->decimal('effective_deposit', 18, 2)->default(0);
            $table->decimal('prop_margin', 18, 2)->default(0);
            $table->decimal('cli_margin', 18, 2)->default(0);
            $table->decimal('non_cash_ben_tm', 18, 2)->default(0);
            $table->decimal('non_cash_ben_cm', 18, 2)->default(0);
            $table->decimal('total_margin', 18, 2)->default(0);
            $table->decimal('utilization', 18, 2)->default(0);
            $table->decimal('tm_cp_margin', 18, 2)->default(0);
            $table->decimal('mtm_loss', 18, 2)->default(0);
            $table->decimal('icmtm', 18, 2)->default(0);
            $table->decimal('trade_margin', 18, 2)->default(0);
            $table->decimal('first_leg_margin', 18, 2)->default(0);
            $table->decimal('reverse_leg_margin', 18, 2)->default(0);
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
        Schema::dropIfExists('tm_margins');
    }
};
