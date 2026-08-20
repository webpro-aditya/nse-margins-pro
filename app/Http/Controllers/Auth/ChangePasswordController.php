<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChangePasswordController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordService,
    ) {}

    /**
     * Show the change password form.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    /**
     * Update the user's password.
     */
    public function store(ChangePasswordRequest $request): RedirectResponse
    {
        $this->passwordService->changePassword(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password'),
        );

        return back()->with('success', 'Password updated successfully.');
    }
}
