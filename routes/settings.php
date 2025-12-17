<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // User Management Routes
    // IMPORTANT: Index route must come first
    Route::middleware('permission:users.view')->group(function () {
        Route::get('settings/users', [UserController::class, 'index'])->name('users.index');
    });

    // IMPORTANT: Create route MUST come before {user} route to prevent route collision
    // Laravel matches routes top-to-bottom, so /settings/users/create must be
    // registered before /settings/users/{user} to avoid "create" being treated as a user ID
    Route::middleware('permission:users.create')->group(function () {
        Route::get('settings/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('settings/users', [UserController::class, 'store'])->name('users.store');
    });

    // Show route comes after create to prevent matching "create" as a user ID
    Route::middleware('permission:users.view')->group(function () {
        Route::get('settings/users/{user}', [UserController::class, 'show'])->name('users.show');
    });

    Route::middleware('permission:users.edit')->group(function () {
        Route::get('settings/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('settings/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('settings/users/{user}', [UserController::class, 'update']);
    });

    Route::delete('settings/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete')
        ->name('users.destroy');

    // Role Management Routes
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('settings/roles', [RoleController::class, 'index'])->name('roles.index');
    });

    // Create route MUST come before {role} route
    Route::middleware('permission:roles.create')->group(function () {
        Route::get('settings/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('settings/roles', [RoleController::class, 'store'])->name('roles.store');
    });

    Route::middleware('permission:roles.view')->group(function () {
        Route::get('settings/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    });

    Route::middleware('permission:roles.edit')->group(function () {
        Route::get('settings/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('settings/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::patch('settings/roles/{role}', [RoleController::class, 'update']);
    });

    Route::delete('settings/roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('permission:roles.delete')
        ->name('roles.destroy');

    // Permission Management Routes
    Route::middleware('permission:permissions.view')->group(function () {
        Route::get('settings/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    });

    // Create route MUST come before {permission} route
    Route::middleware('permission:permissions.create')->group(function () {
        Route::get('settings/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
        Route::post('settings/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    });

    Route::middleware('permission:permissions.view')->group(function () {
        Route::get('settings/permissions/{permission}', [PermissionController::class, 'show'])->name('permissions.show');
    });

    Route::middleware('permission:permissions.edit')->group(function () {
        Route::get('settings/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
        Route::put('settings/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::patch('settings/permissions/{permission}', [PermissionController::class, 'update']);
    });

    Route::delete('settings/permissions/{permission}', [PermissionController::class, 'destroy'])
        ->middleware('permission:permissions.delete')
        ->name('permissions.destroy');
});
