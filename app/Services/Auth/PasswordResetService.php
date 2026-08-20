<?php

namespace App\Services\Auth;

use App\Events\Auth\PasswordResetCompleted;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Handles password reset flow (send link, reset password) and password change.
 *
 * Uses Laravel's built-in Password Broker for token management.
 * The broker handles:
 * - Token generation and hashing
 * - Token expiration (60 minutes by default, configurable in config/auth.php)
 * - Throttling (1 request per 60 seconds per email)
 */
class PasswordResetService
{
    /**
     * Send a password reset link to the given email address.
     *
     * Returns the broker status string for the controller to interpret.
     * The same response is given whether the email exists or not (no user enumeration).
     */
    public function sendResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    /**
     * Reset the user's password using a valid reset token.
     *
     * @param  array{token: string, email: string, password: string, password_confirmation: string}  $data
     */
    public function resetPassword(array $data): string
    {
        return Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
                event(new PasswordResetCompleted($user));
            }
        );
    }

    /**
     * Change the authenticated user's password.
     *
     * @throws \RuntimeException If the current password doesn't match.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'remember_token' => Str::random(60),
        ])->save();

        return true;
    }
}
