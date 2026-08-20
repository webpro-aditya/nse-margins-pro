<?php

namespace App\Providers;

use App\Events\Auth\LoginFailed;
use App\Events\Auth\PasswordResetCompleted;
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\UserLoggedOut;
use App\Listeners\Auth\LogAuthenticationEvent;
use App\Listeners\Auth\UpdateLastLogin;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        $this->configurePasswordDefaults();
        $this->registerAuthEvents();
    }

    /**
     * Configure the default password validation rules.
     *
     * In production: min 8 chars, mixed case, numbers, symbols.
     * In development: relaxed for convenience (min 6).
     */
    private function configurePasswordDefaults(): void
    {
        Password::defaults(function () {
            $rule = Password::min(8);

            return $this->app->isProduction()
                ? $rule->mixedCase()->numbers()->symbols()->uncompromised()
                : $rule;
        });
    }

    /**
     * Register authentication event listeners.
     *
     * Using explicit registration rather than event discovery
     * for clarity and maintainability.
     */
    private function registerAuthEvents(): void
    {
        // Update last login info
        Event::listen(UserLoggedIn::class, UpdateLastLogin::class);

        // Log all auth events for audit trail
        Event::listen(UserLoggedIn::class, [LogAuthenticationEvent::class, 'handle']);
        Event::listen(UserLoggedOut::class, [LogAuthenticationEvent::class, 'handle']);
        Event::listen(LoginFailed::class, [LogAuthenticationEvent::class, 'handle']);
        Event::listen(PasswordResetCompleted::class, [LogAuthenticationEvent::class, 'handle']);
    }
}
