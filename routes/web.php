<?php

use App\Http\Controllers\Auth\ChangePasswordController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

include 'test.php';
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Authentication routes are organized into two groups:
| 1. Guest routes — accessible only when NOT logged in (middleware: guest)
| 2. Auth routes — accessible only when logged in (middleware: auth)
|
| The 'guest' middleware redirects authenticated users to the dashboard.
| The 'auth' middleware redirects unauthenticated users to the login page.
|
*/

// Public routes (accessible to everyone)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Guest routes — redirect to dashboard if already authenticated
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'store'])->name('password.store');
});

// Authenticated routes — redirect to login if not authenticated
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/change-password', [ChangePasswordController::class, 'create'])->name('password.change');
    Route::put('/change-password', [ChangePasswordController::class, 'store'])->name('password.update');

    Route::get('/dashboard', [\App\Http\Controllers\MarginController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Margin Pages
    Route::prefix('margins')->name('margins.')->group(function () {
        Route::get('/cm', [\App\Http\Controllers\MarginController::class, 'cmMargins'])->name('cm');
        Route::get('/tm', [\App\Http\Controllers\MarginController::class, 'tmMargins'])->name('tm');
        Route::get('/clients', [\App\Http\Controllers\MarginController::class, 'cliMargins'])->name('clients');
        Route::get('/security', [\App\Http\Controllers\MarginController::class, 'securityMargin'])->name('security');
        Route::get('/settlement', [\App\Http\Controllers\MarginController::class, 'settlementMargin'])->name('settlement');
    });

    // API Routes for async ops
    Route::prefix('api/margins')->name('api.margins.')->group(function () {
        Route::post('/refresh', [\App\Http\Controllers\MarginController::class, 'refresh'])->name('refresh');
        Route::post('/bulk-generate', [\App\Http\Controllers\MarginController::class, 'triggerBulkGenerate'])->name('bulk-generate');
        Route::get('/bulk-download/{filename}', [\App\Http\Controllers\MarginController::class, 'downloadBulkFile'])->name('bulk-download')->where('filename', '.*');
    });
});