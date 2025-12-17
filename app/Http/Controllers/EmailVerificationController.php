<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    /**
     * Display the email verification notice.
     */
    public function notice(Request $request): Response|RedirectResponse
    {
        return $request->user()->hasVerifiedEmail()
            ? redirect()->intended(route('dashboard'))
            : Inertia::render('auth/verify-email');
    }

    /**
     * Handle email verification.
     */
    public function verify(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->intended(route('dashboard'))->with('success', 'Email verified successfully!');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        $key = 'email-verification:' . $request->user()->id;

        if (RateLimiter::tooManyAttempts($key, 2)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->with('error', "Too many attempts. Please try again in {$seconds} seconds.");
        }

        RateLimiter::hit($key, 300);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $request->user()->id, 'hash' => sha1($request->user()->email)]
        );

        Mail::to($request->user()->email)->send(
            new VerifyEmail($verificationUrl, $request->user()->name)
        );

        return back()->with('success', 'Verification link sent to your email!');
    }
}
