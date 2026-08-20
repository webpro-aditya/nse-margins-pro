<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordService,
    ) {}

    /**
     * Show the forgot password form.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Send a password reset link.
     *
     * Always shows a success-like message regardless of whether the email
     * exists in the database — this prevents user enumeration.
     */
    public function store(ForgotPasswordRequest $request): RedirectResponse
    {
        $status = $this->passwordService->sendResetLink(
            $request->validated('email'),
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        // Even for throttled requests, we show a generic message
        // to prevent user enumeration. The only exception is
        // the throttle message which is useful UX.
        if ($status === Password::RESET_THROTTLED) {
            return back()->withErrors([
                'email' => __($status),
            ]);
        }

        // For any other status (e.g., INVALID_USER), still show success
        // to prevent email enumeration
        return back()->with(
            'status',
            __('passwords.sent'),
        );
    }
}
