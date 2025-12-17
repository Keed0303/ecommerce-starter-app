# Mailtrap Email Configuration Guide

## Overview

Mailtrap is an excellent email testing service that allows you to test email functionality without sending real emails to users. This guide will help you configure your Laravel application to use Mailtrap for sending verification emails.

## Your Mailtrap Credentials

You have been provided with:
- **API Token:** `e196600feb3e584de5f603a1c0366d78`
- **Test Email:** `kydnagpala.dev@gmail.com`
- **From Address:** `hello@demomailtrap.com`

## Configuration Option 1: SMTP (Recommended)

### Step 1: Update Your .env File

Open your `.env` file and update the mail configuration:

```env
MAIL_MAILER=smtp
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=e196600feb3e584de5f603a1c0366d78
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@demomailtrap.com"
MAIL_FROM_NAME="Laravel Starter"
```

### Step 2: Clear Configuration Cache

```bash
php artisan config:clear
php artisan cache:clear
```

### Step 3: Test the Configuration

```bash
php artisan tinker
```

Then run:
```php
Mail::raw('Test email from Laravel', function($msg) {
    $msg->to('kydnagpala.dev@gmail.com')
        ->subject('Test Email');
});
```

### Step 4: Check Your Email

Check `kydnagpala.dev@gmail.com` for the test email!

## Configuration Option 2: Mailtrap API (Alternative)

If you prefer to use the Mailtrap API directly, you'll need to create a custom mailer. Here's how:

### Step 1: Install Guzzle (if not already installed)

```bash
composer require guzzlehttp/guzzle
```

### Step 2: Create a Custom Mailtrap Transport

```bash
php artisan make:provider MailtrapServiceProvider
```

### Step 3: Update .env

```env
MAIL_MAILER=mailtrap
MAILTRAP_API_TOKEN=e196600feb3e584de5f603a1c0366d78
MAIL_FROM_ADDRESS="hello@demomailtrap.com"
MAIL_FROM_NAME="Laravel Starter"
```

## Testing Email Verification Flow

### 1. Start Your Application

```bash
php artisan serve
```

### 2. Start Queue Worker (Important!)

Open a new terminal and run:

```bash
php artisan queue:work
```

This is required because emails are queued for sending.

### 3. Register a New User

1. Navigate to `http://localhost:8000/register`
2. Fill in the registration form:
   - Name: Test User
   - Email: kydnagpala.dev@gmail.com
   - Password: password

3. Submit the form

### 4. Check for Verification Email

Check your email at `kydnagpala.dev@gmail.com` for the verification email!

### 5. Click the Verification Link

Click the "Verify Email Address" button in the email to complete verification.

## Troubleshooting

### Emails Not Sending?

**1. Check Queue Worker is Running:**
```bash
# Check if queue worker is active
ps aux | grep queue:work

# If not running, start it:
php artisan queue:work
```

**2. Check Configuration:**
```bash
php artisan config:clear
php artisan config:cache
```

**3. Check Logs:**
```bash
tail -f storage/logs/laravel.log
```

**4. Test Mail Connection:**
```bash
php artisan tinker
```
```php
use Illuminate\Support\Facades\Mail;

Mail::raw('Test', function($msg) {
    $msg->to('kydnagpala.dev@gmail.com')->subject('Test');
});
```

### Common Issues

**Issue: "Connection refused"**
- Solution: Check your internet connection and firewall settings

**Issue: "Authentication failed"**
- Solution: Verify your API token is correct in `.env`

**Issue: "Emails queued but not sent"**
- Solution: Make sure `php artisan queue:work` is running

**Issue: "Mail sent but not received"**
- Solution: Check spam folder, verify email address is correct

## Monitoring Email Delivery

### Option 1: Check Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

Look for entries like:
```
[YYYY-MM-DD HH:MM:SS] local.INFO: Email sent to kydnagpala.dev@gmail.com
```

### Option 2: Check Queue Status

```bash
php artisan queue:failed
```

This shows any failed queue jobs, including email sending failures.

### Option 3: Mailtrap Dashboard

1. Login to [Mailtrap.io](https://mailtrap.io)
2. Go to your inbox
3. View sent emails and delivery status

## Production Configuration

When moving to production, you can continue using Mailtrap or switch to a production email service.

### Continue with Mailtrap (Paid Plan)

Mailtrap offers production email sending with their Email API/SMTP service:

```env
MAIL_MAILER=smtp
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=your-production-api-token
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="Your App Name"
```

### Switch to Other Services

See [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md) for configurations for:
- Gmail SMTP
- SendGrid
- Mailgun
- Amazon SES

## Quick Start Checklist

- [ ] Update `.env` with Mailtrap SMTP settings
- [ ] Run `php artisan config:clear`
- [ ] Start application: `php artisan serve`
- [ ] Start queue worker: `php artisan queue:work`
- [ ] Register new user with your email
- [ ] Check email inbox for verification email
- [ ] Click verification link
- [ ] Verify user is redirected to dashboard

## Example Email Preview

When a user registers, they will receive an email like this:

**Subject:** Verify Your Email Address

**From:** Laravel Starter <hello@demomailtrap.com>

**To:** kydnagpala.dev@gmail.com

**Content:**
- Personalized greeting
- Beautiful gradient header
- Clear "Verify Email Address" button
- Alternative text link
- Expiration notice (60 minutes)
- Security tips
- Professional footer

## Advanced Configuration

### Change Email Timeout

In `config/mail.php`:

```php
'timeout' => 30, // seconds
```

### Queue Configuration

In `.env`:

```env
QUEUE_CONNECTION=database
```

Then create queue table if not exists:

```bash
php artisan queue:table
php artisan migrate
```

### Rate Limiting

The system already includes rate limiting:
- **Verification resend:** 2 attempts per 5 minutes
- **Verification endpoint:** 6 attempts per minute

## Support

### Mailtrap Support
- Website: https://mailtrap.io
- Documentation: https://help.mailtrap.io
- Support: support@mailtrap.io

### Laravel Mail Documentation
- [Laravel Mail](https://laravel.com/docs/11.x/mail)
- [Laravel Queues](https://laravel.com/docs/11.x/queues)

---

**Your Mailtrap Setup:**
- API Token: `e196600feb3e584de5f603a1c0366d78`
- From Email: `hello@demomailtrap.com`
- Test Email: `kydnagpala.dev@gmail.com`
- SMTP Host: `live.smtp.mailtrap.io`
- SMTP Port: `587`
- Username: `api`
- Password: Use your API token

**Ready to test!** 🚀
