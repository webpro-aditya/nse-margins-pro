<?php

namespace App\Listeners\Auth;

use App\Events\Auth\LoginFailed;
use App\Events\Auth\PasswordResetCompleted;
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\UserLoggedOut;
use Illuminate\Support\Facades\Log;

/**
 * Logs all authentication events for security audit trail.
 *
 * In production, consider sending these to a dedicated audit log
 * table or an external service (Datadog, Sentry, etc.).
 */
class LogAuthenticationEvent
{
    public function handle(UserLoggedIn|UserLoggedOut|LoginFailed|PasswordResetCompleted $event): void
    {
        match (true) {
            $event instanceof UserLoggedIn => Log::info('User logged in', [
                'user_id' => $event->user->id,
                'email' => $event->user->email,
                'ip' => $event->ipAddress,
            ]),
            $event instanceof UserLoggedOut => Log::info('User logged out', [
                'user_id' => $event->user->id,
                'email' => $event->user->email,
            ]),
            $event instanceof LoginFailed => Log::warning('Login attempt failed', [
                'email' => $event->email,
                'ip' => $event->ipAddress,
            ]),
            $event instanceof PasswordResetCompleted => Log::info('Password reset completed', [
                'user_id' => $event->user->id,
                'email' => $event->user->email,
            ]),
        };
    }
}
