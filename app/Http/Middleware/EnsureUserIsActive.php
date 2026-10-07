<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (Auth::check() && $user) {
            $canAuthenticate = true;

            if ($user->status instanceof UserStatus) {
                $canAuthenticate = $user->status->canAuthenticate();
            } elseif (is_string($user->status)) {
                $canAuthenticate = strtolower($user->status) === 'active';
            }

            if (!$canAuthenticate) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')
                    ->withErrors(['email' => 'Your account has been deactivated or suspended.']);
            }
        }

        return $next($request);
    }
}
