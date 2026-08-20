<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserLoggedIn;

/**
 * Updates the user's last login timestamp and IP address.
 *
 * Runs synchronously (no ShouldQueue) because the data should
 * be immediately available in the dashboard after login.
 */
class UpdateLastLogin
{
    public function handle(UserLoggedIn $event): void
    {
        $event->user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $event->ipAddress,
        ])->save();
    }
}
