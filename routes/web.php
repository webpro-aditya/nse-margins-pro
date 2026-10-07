<?php

use App\Http\Controllers\Auth\ChangePasswordController;
use App\Http\Controllers\Segments\CmController;
use App\Http\Controllers\Segments\FoController;
use App\Http\Controllers\Segments\CdController;
use App\Http\Controllers\Segments\CoController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\MarginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Segments\SettlementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
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

    Route::get('/dashboard', [MarginController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

    // V2 UI Routes
    Route::prefix('v2')->name('v2.')->middleware(['auth', 'verified'])->group(function () {
        Route::get('/dashboard', [MarginController::class, 'dashboardV2'])->name('dashboard');
        Route::get('/margins/{segment}', [MarginController::class, 'marginsV2'])->name('margins');
    });

    // V3 UI Routes (Sidebar layout)
    Route::prefix('v3')->name('v3.')->middleware(['auth', 'verified'])->group(function () {
        Route::get('/dashboard', [MarginController::class, 'dashboardV3'])->name('dashboard');
        Route::get('/margins/{segment}', [MarginController::class, 'marginsV3'])->name('margins');
    });

    // Profile routes removed as controller doesn't exist
    // Margin Pages
    Route::prefix('margins')->name('margins.')->group(function () {
        Route::get('/cm', [CmController::class, 'index'])->name('cm');
        Route::get('/fo', [FoController::class, 'index'])->name('fo');
        Route::get('/cd', [CdController::class, 'index'])->name('cd');
        Route::get('/co', [CoController::class, 'index'])->name('co');
        Route::get('/settlement', [SettlementController::class, 'index'])->name('settlement');
    });

    // API Routes for async ops
    Route::prefix('api/margins')->name('api.margins.')->group(function () {
        Route::post('/refresh', [MarginController::class, 'refresh'])->name('refresh');
        Route::post('/bulk-generate', [MarginController::class, 'triggerBulkGenerate'])->name('bulk-generate');
        Route::get('/bulk-download/{filename}', [MarginController::class, 'downloadBulkFile'])->name('bulk-download')->where('filename', '.*');
    });
});