# Email Verification System - Setup Guide

## Overview

This application now includes a complete email verification system that requires users to verify their email addresses after registration. This guide will help you configure and test the email verification feature.

## Features Implemented

✅ **Email Verification Flow**
- Users receive verification emails upon registration
- Secure signed URLs with 60-minute expiration
- Email resend functionality with rate limiting
- Automatic email sending on user registration

✅ **Security Features**
- Signed verification URLs to prevent tampering
- Rate limiting on resend requests (2 attempts per 5 minutes)
- Throttling on verification endpoints (6 attempts per minute)
- Unverified users redirected to verification notice page

✅ **User Experience**
- Beautiful HTML email template with branding
- User-friendly verification notice page
- Clear error and success messages
- Responsive email design

✅ **Integration**
- RBAC system integration
- Middleware protection for verified users only
- Event-driven email sending
- Queue support for email delivery

## Files Created/Modified

### Backend Files

#### Controllers
- `app/Http/Controllers/EmailVerificationController.php` - Handles verification logic

#### Models
- `app/Models/User.php` - Implements `MustVerifyEmail` contract

#### Mail
- `app/Mail/VerifyEmail.php` - Mailable class for verification emails
- `resources/views/emails/verify-email.blade.php` - Email template

#### Listeners
- `app/Listeners/SendEmailVerificationNotification.php` - Sends email on registration

#### Providers
- `app/Providers/AppServiceProvider.php` - Registers event listener

### Frontend Files

#### Pages
- `resources/js/pages/auth/verify-email.tsx` - Verification notice page (already existed)

#### Routes
- `resources/js/routes/verification/index.ts` - Route definitions (already existed)

### Configuration Files

- `routes/web.php` - Email verification routes
- `bootstrap/app.php` - Middleware configuration
- `.env.example` - Mail configuration examples

## Setup Instructions

### 1. Environment Configuration

Copy the `.env.example` file to `.env` if you haven't already:

```bash
cp .env.example .env
```

### 2. Configure Mail Settings

#### For Development (Log Driver - Default)

The default configuration logs emails to `storage/logs/laravel.log`:

```env
MAIL_MAILER=log
```

#### For Development/Production (SMTP with Mailtrap) ⭐ RECOMMENDED

[Mailtrap](https://mailtrap.io/) is great for testing and production email sending:

**Your Mailtrap Configuration:**
```env
MAIL_MAILER=smtp
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=e196600feb3e584de5f603a1c0366d78
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@demomailtrap.com"
MAIL_FROM_NAME="${APP_NAME}"
```

> **Note:** See [MAILTRAP_SETUP.md](./MAILTRAP_SETUP.md) for detailed Mailtrap configuration and testing instructions.

#### For Production (Gmail SMTP)

1. Enable 2-factor authentication in your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Configure:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

#### For Production (Other Providers)

**Mailgun:**
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_SECRET=your-mailgun-api-key
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

**SendGrid:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

**Amazon SES:**
```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 3. Queue Configuration (Recommended for Production)

Email sending is queued for better performance. Set up queue workers:

```env
QUEUE_CONNECTION=database
```

Run the queue worker:

```bash
php artisan queue:work
```

For production, use Supervisor to keep the queue worker running:

```bash
php artisan queue:table
php artisan migrate
```

### 4. Application URL

Set your application URL correctly for verification links:

```env
APP_URL=http://localhost:8000
```

For production, use your actual domain:

```env
APP_URL=https://yourdomain.com
```

## Testing the Email Verification System

### 1. Register a New User

1. Navigate to `/register`
2. Fill in the registration form
3. Submit the form

### 2. Check for Verification Email

**If using log driver:**
- Check `storage/logs/laravel.log`
- Look for the email content with verification link

**If using Mailtrap:**
- Login to Mailtrap
- Check your inbox for the verification email

**If using real SMTP:**
- Check the registered email inbox

### 3. Verify Email

Click the verification link in the email, or manually navigate to:
```
/email/verify/{id}/{hash}?expires={timestamp}&signature={signature}
```

### 4. Test Resend Functionality

1. Go to `/email/verify`
2. Click "Resend Verification Email"
3. Verify rate limiting (max 2 requests per 5 minutes)

### 5. Test Protected Routes

Try accessing `/dashboard` or other protected routes:
- Unverified users → Redirected to `/email/verify`
- Verified users → Access granted

## Routes Reference

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET | `/email/verify` | `verification.notice` | Show verification notice |
| GET | `/email/verify/{id}/{hash}` | `verification.verify` | Handle verification |
| POST | `/email/verification-notification` | `verification.send` | Resend verification email |

## Middleware Usage

Protect routes with email verification:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

## Customization

### Email Template

Edit the email template at:
```
resources/views/emails/verify-email.blade.php
```

Customize:
- Colors and branding
- Button styling
- Email content and messaging
- Security tips

### Verification Notice Page

Edit the frontend component at:
```
resources/js/pages/auth/verify-email.tsx
```

### Expiration Time

Change the verification link expiration in:
```php
// app/Listeners/SendEmailVerificationNotification.php
// app/Http/Controllers/EmailVerificationController.php

URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(60), // Change this value
    [...]
);
```

### Rate Limiting

Adjust rate limits in `EmailVerificationController.php`:

```php
// Resend rate limit (currently 2 per 5 minutes)
if (RateLimiter::tooManyAttempts($key, 2)) {
    // ...
}
RateLimiter::hit($key, 300); // 300 seconds = 5 minutes
```

## Troubleshooting

### Emails Not Sending

1. **Check queue is running:**
   ```bash
   php artisan queue:work
   ```

2. **Check mail configuration:**
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

3. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test mail configuration:**
   ```bash
   php artisan tinker
   Mail::raw('Test email', function($msg) {
       $msg->to('test@example.com')->subject('Test');
   });
   ```

### Verification Links Not Working

1. **Check APP_URL is correct** in `.env`
2. **Verify signed URL middleware** is applied
3. **Check link hasn't expired** (60 minutes default)
4. **Clear route cache:**
   ```bash
   php artisan route:clear
   ```

### Users Already Registered

For existing users without verification, manually mark as verified:

```bash
php artisan tinker
User::where('email', 'user@example.com')->update(['email_verified_at' => now()]);
```

Or create a migration/seeder to mark all existing users as verified.

## Security Considerations

✅ **Implemented Security Measures:**

1. **Signed URLs** - Prevents tampering with verification links
2. **Expiration** - Links expire after 60 minutes
3. **Rate Limiting** - Prevents abuse of resend functionality
4. **Throttling** - Limits verification attempts
5. **HTTPS** - Always use HTTPS in production
6. **Queue Processing** - Emails sent asynchronously to prevent blocking

⚠️ **Production Recommendations:**

1. Use a dedicated email service (Mailgun, SendGrid, SES)
2. Enable HTTPS and set `APP_URL` correctly
3. Monitor email delivery rates
4. Set up email authentication (SPF, DKIM, DMARC)
5. Use environment variables, never hardcode credentials
6. Keep queue workers running with Supervisor
7. Monitor queue failures

## Database Schema

The `users` table includes:

```sql
email_verified_at TIMESTAMP NULL
```

This column is:
- `NULL` for unverified users
- Set to current timestamp upon verification
- Used by `verified` middleware to check verification status

## Integration with Existing Systems

### RBAC Integration

Email verification works seamlessly with the existing role-based access control:

```php
// Routes can require both authentication and verification
Route::middleware(['auth', 'verified', 'permission:dashboard.view'])
    ->get('/dashboard', [DashboardController::class, 'index']);
```

### Seeded Users

The seeders automatically mark seeded users as verified:
- Super Admin: Already verified
- Test users in DashboardSeeder: Already verified

## Support and Documentation

For Laravel email verification documentation:
- [Laravel Email Verification](https://laravel.com/docs/11.x/verification)
- [Laravel Mail](https://laravel.com/docs/11.x/mail)

For mail service providers:
- [Mailtrap](https://mailtrap.io/) - Development testing
- [Mailgun](https://www.mailgun.com/) - Production emails
- [SendGrid](https://sendgrid.com/) - Production emails
- [Amazon SES](https://aws.amazon.com/ses/) - Production emails

## Next Steps

1. Configure your mail settings in `.env`
2. Test the verification flow in development
3. Customize the email template to match your branding
4. Set up queue workers for production
5. Configure your production mail service
6. Test the complete flow before deploying

---

**Last Updated:** December 14, 2025
**Laravel Version:** 11.x
**Email System:** Fully Integrated and Tested
