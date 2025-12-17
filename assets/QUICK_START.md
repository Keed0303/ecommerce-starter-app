# Quick Start Guide - Email Verification

## 🚀 Test Email Verification in 5 Minutes

Follow these simple steps to test the email verification system right now!

### Step 1: Update Your .env File

Open `.env` and add/update these lines:

```env
MAIL_MAILER=smtp
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=e196600feb3e584de5f603a1c0366d78
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@demomailtrap.com"
MAIL_FROM_NAME="Laravel Starter"

APP_URL=http://localhost:8000

QUEUE_CONNECTION=database
```

### Step 2: Clear Configuration Cache

```bash
php artisan config:clear
php artisan cache:clear
```

### Step 3: Start Your Application

Open **Terminal 1**:
```bash
php artisan serve
```

### Step 4: Start Queue Worker

Open **Terminal 2**:
```bash
php artisan queue:work
```

> **Important:** Keep both terminals running!

### Step 5: Register a New User

1. Open your browser: `http://localhost:8000/register`
2. Fill in the form:
   - **Name:** Test User
   - **Email:** kydnagpala.dev@gmail.com
   - **Password:** password
   - **Confirm Password:** password
3. Click "Register"

### Step 6: Check Your Email

1. Go to your email: `kydnagpala.dev@gmail.com`
2. Look for an email with subject: **"Verify Your Email Address"**
3. Click the **"Verify Email Address"** button

### Step 7: Done! ✅

You should be redirected to the dashboard. Your email is now verified!

---

## What to Check in Terminal 2 (Queue Worker)

You should see output like:
```
[YYYY-MM-DD HH:MM:SS] Processing: App\Listeners\SendEmailVerificationNotification
[YYYY-MM-DD HH:MM:SS] Processed:  App\Listeners\SendEmailVerificationNotification
```

---

## Troubleshooting

### Email Not Received?

**1. Check Terminal 2 (queue worker)** - Is it running?
```bash
# If not running, start it:
php artisan queue:work
```

**2. Check logs:**
```bash
tail -f storage/logs/laravel.log
```

**3. Check spam folder** in your email

**4. Retry sending:**
- Go to `http://localhost:8000/email/verify`
- Click "Resend Verification Email"

### Can't Access Dashboard?

Make sure your email is verified. You can check in database:

```bash
php artisan tinker
```
```php
User::where('email', 'kydnagpala.dev@gmail.com')->first()->email_verified_at
```

If it's `null`, manually verify:
```php
User::where('email', 'kydnagpala.dev@gmail.com')->update(['email_verified_at' => now()]);
```

---

## Test the Resend Feature

1. Go to: `http://localhost:8000/email/verify`
2. Click "Resend Verification Email"
3. Check your email again
4. You can only resend 2 times per 5 minutes (rate limiting)

---

## Next Steps

✅ Email verification is working!

Now you can:
1. Customize the email template: `resources/views/emails/verify-email.blade.php`
2. Customize the verification page: `resources/js/pages/auth/verify-email.tsx`
3. Change expiration time: `app/Listeners/SendEmailVerificationNotification.php` (line 37)
4. Read full documentation: [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md)

---

## Your Mailtrap Details

- **API Token:** e196600feb3e584de5f603a1c0366d78
- **From Email:** hello@demomailtrap.com
- **Test Email:** kydnagpala.dev@gmail.com
- **SMTP Host:** live.smtp.mailtrap.io
- **SMTP Port:** 587

For more details, see: [MAILTRAP_SETUP.md](./MAILTRAP_SETUP.md)

---

**Happy Testing!** 🎉
