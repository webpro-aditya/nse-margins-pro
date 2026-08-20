<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handles the login and logout flows.
 *
 * The controller is deliberately thin — all business logic
 * (credential checking, session management, event dispatching)
 * is delegated to AuthenticationService.
 */
class LoginController extends Controller
{
    public function __construct(
        private readonly AuthenticationService $authService,
    ) {}

    /**
     * Show the login form.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle a login attempt.
     *
     * Flow:
     * 1. Validate input (LoginRequest)
     * 2. Check rate limit
     * 3. Attempt authentication (service)
     * 4. On failure: increment rate limiter, throw validation error
     * 5. On success: clear rate limiter, redirect to intended URL
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $result = $this->authService->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember'),
            $request,
        );

        if (! $result['success']) {
            $request->hitRateLimiter();

            throw ValidationException::withMessages([
                'email' => $result['message'],
            ]);
        }

        $request->clearRateLimiter();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Handle logout.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->authService->logout($request);

        return redirect('/');
    }
}
