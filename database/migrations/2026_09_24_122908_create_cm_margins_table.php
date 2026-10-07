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
        Schema::create('cm_margins', function (Blueprint $table) {
            $table->id();
            $table->string('mem_code', 5)->index();
            $table->decimal('cash_collateral', 18, 2)->default(0);
            $table->decimal('non_cash_collateral', 18, 2)->default(0);
            $table->decimal('effective_deposit', 18, 2)->default(0);
            $table->decimal('prop_margin', 18, 2)->default(0);
            $table->decimal('tm_margin', 18, 2)->default(0);
            $table->decimal('total_margin', 18, 2)->default(0);
            $table->decimal('utilization', 18, 2)->default(0);
            $table->decimal('mtm_loss', 18, 2)->default(0);
            $table->decimal('trade_margin', 18, 2)->default(0);
            $table->decimal('icmtm', 18, 2)->default(0);
            $table->date('margin_date')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cm_margins');
    }
};
