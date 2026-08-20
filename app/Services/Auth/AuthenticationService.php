<?php

namespace App\Services\Auth;

use App\Enums\UserStatus;
use App\Events\Auth\LoginFailed;
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\UserLoggedOut;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Handles all authentication logic: login attempts, session management, logout.
 *
 * Why a service instead of putting this in the controller?
 * - Testable in isolation (no HTTP layer needed).
 * - Reusable: same logic can be used for API auth, CLI auth, or queue jobs.
 * - Single responsibility: the controller only handles HTTP concerns.
 *
 * Why not a Repository?
 * - We're not abstracting data access — Eloquent IS the data layer.
 * - A UserRepository would be an unnecessary wrapper that mirrors Eloquent's API.
 */
class AuthenticationService
{
    /**
     * Attempt to authenticate a user with the given credentials.
     *
     * Security measures:
     * 1. Always runs Hash::check even if user not found (timing attack prevention).
     * 2. Checks account status AFTER password verification (no user enumeration via status).
     * 3. Regenerates session on successful login (session fixation prevention).
     *
     * @param  array{email: string, password: string}  $credentials
     * @return array{success: bool, message: string}
     */
    public function attempt(array $credentials, bool $remember, Request $request): array
    {
        $user = User::where('email', $credentials['email'])->first();

        // Timing-attack safe: always run hash check even if user is null.
        // If user is null, we check against a dummy hash so the response time
        // is consistent regardless of whether the email exists.
        $passwordValid = false;

        if ($user) {
            $passwordValid = Hash::check($credentials['password'], $user->password);
        } else {
            // Dummy hash check to prevent timing attacks
            Hash::check($credentials['password'], '$2y$12$1S56oR2YX/LQnbrP93cy4.Zg2A9aSCjx.0oBjEzgjaOJJCwbgVoHy');
        }

        if (! $user || ! $passwordValid) {
            event(new LoginFailed($credentials['email'], $request->ip() ?? 'unknown'));

            return [
                'success' => false,
                'message' => __('auth.failed'),
            ];
        }

        // Check account status AFTER password verification
        // This prevents user enumeration via different error messages.
        if (! $user->status->canAuthenticate()) {
            return [
                'success' => false,
                'message' => __('auth.account_disabled'),
            ];
        }

        // Authenticate the user
        Auth::login($user, $remember);

        // Regenerate session to prevent session fixation attacks
        $request->session()->regenerate();

        // Dispatch login event for listeners (update last_login, audit log)
        event(new UserLoggedIn($user, $request->ip() ?? 'unknown'));

        return [
            'success' => true,
            'message' => 'Login successful.',
        ];
    }

    /**
     * Log the user out and invalidate the session.
     *
     * Session invalidation + token regeneration prevents session reuse.
     */
    public function logout(Request $request): void
    {
        $user = $request->user();

        Auth::guard('web')->logout();

        // Invalidate the current session completely
        $request->session()->invalidate();

        // Generate a new CSRF token
        $request->session()->regenerateToken();

        if ($user) {
            event(new UserLoggedOut($user));
        }
    }
}
