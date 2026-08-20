<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds authentication-related fields to the users table.
 *
 * - status: Account state (active/inactive/suspended)
 * - last_login_at: Timestamp of most recent login
 * - last_login_ip: IP address of most recent login
 * - deleted_at: Soft delete support
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('active')->after('password')->index();
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'last_login_at', 'last_login_ip']);
            $table->dropSoftDeletes();
        });
    }
};
