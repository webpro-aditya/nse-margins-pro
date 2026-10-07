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
        Schema::create('cli_margins', function (Blueprint $table) {
            $table->id();
            $table->string('mem_code', 5)->index();
            $table->string('mem_name', 100)->nullable();
            $table->string('tm_code', 5)->index();
            $table->string('tm_name', 100)->nullable();
            $table->string('cli_code', 10)->index();
            $table->decimal('cash_collateral', 18, 2)->default(0);
            $table->decimal('non_cash_collateral', 18, 2)->default(0);
            $table->decimal('mtm_loss', 18, 2)->default(0);
            $table->decimal('trade_margin', 18, 2)->default(0);
            $table->decimal('icmtm', 18, 2)->default(0);
            $table->decimal('margin_on_first_leg', 18, 2)->default(0);
            $table->decimal('margin_on_reverse_leg', 18, 2)->default(0);
            $table->decimal('total_margin', 18, 2)->default(0);
            $table->decimal('cli_margin', 18, 2)->default(0);
            $table->decimal('cli_excess_noncash', 18, 2)->default(0);
            $table->decimal('eligible_non_cash', 18, 2)->default(0);
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
        Schema::dropIfExists('cli_margins');
    }
};
