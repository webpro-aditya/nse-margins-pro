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
        Schema::table('tm_margins', function (Blueprint $table) {
            $table->decimal('ini_margin', 18, 2)->default(0)->after('utilization');
            $table->decimal('cobg', 18, 2)->default(0)->after('ini_margin');
            $table->decimal('delivery_margin', 18, 2)->default(0)->after('cobg');
            $table->decimal('extrme_loss_margin', 18, 2)->default(0)->after('delivery_margin');
            $table->decimal('iumtm', 18, 2)->default(0)->after('extrme_loss_margin');
        });
        
        Schema::table('cli_margins', function (Blueprint $table) {
            $table->decimal('ini_margin', 18, 2)->default(0)->after('total_margin');
            $table->decimal('cobg', 18, 2)->default(0)->after('ini_margin');
            $table->decimal('delivery_margin', 18, 2)->default(0)->after('cobg');
            $table->decimal('extrme_loss_margin', 18, 2)->default(0)->after('delivery_margin');
            $table->decimal('cli_excess_margins', 18, 2)->default(0)->after('extrme_loss_margin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tm_margins', function (Blueprint $table) {
            $table->dropColumn(['ini_margin', 'cobg', 'delivery_margin', 'extrme_loss_margin', 'iumtm']);
        });
        
        Schema::table('cli_margins', function (Blueprint $table) {
            $table->dropColumn(['ini_margin', 'cobg', 'delivery_margin', 'extrme_loss_margin', 'cli_excess_margins']);
        });
    }
};
