<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailVerificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:2,1')
        ->name('verification.send');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Category routes
    Route::middleware('permission:categories.view')->group(function () {
        Route::get('categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
    });

    Route::middleware('permission:categories.create')->group(function () {
        Route::get('categories/create', [\App\Http\Controllers\CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [\App\Http\Controllers\CategoryController::class, 'store'])->name('categories.store');
    });

    Route::middleware('permission:categories.view')->group(function () {
        Route::get('categories/{category}', [\App\Http\Controllers\CategoryController::class, 'show'])->name('categories.show');
    });

    Route::middleware('permission:categories.edit')->group(function () {
        Route::get('categories/{category}/edit', [\App\Http\Controllers\CategoryController::class, 'edit'])->name('categories.edit');
        Route::put('categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->name('categories.update');
        Route::patch('categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update']);
    });

    Route::delete('categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])
        ->middleware('permission:categories.delete')
        ->name('categories.destroy');

    // Product routes
    Route::middleware('permission:products.view')->group(function () {
        Route::get('products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    });

    Route::middleware('permission:products.create')->group(function () {
        Route::get('products/create', [\App\Http\Controllers\ProductController::class, 'create'])->name('products.create');
        Route::post('products', [\App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
    });

    Route::middleware('permission:products.view')->group(function () {
        Route::get('products/{product}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    });

    Route::middleware('permission:products.edit')->group(function () {
        Route::get('products/{product}/edit', [\App\Http\Controllers\ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
        Route::patch('products/{product}', [\App\Http\Controllers\ProductController::class, 'update']);
    });

    Route::delete('products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])
        ->middleware('permission:products.delete')
        ->name('products.destroy');
});

require __DIR__.'/settings.php';
