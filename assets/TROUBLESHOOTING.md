# Troubleshooting Guide - Email Verification

## 🔧 Common Issues and Solutions

### ❌ Error: "550 5.7.1 Sending from domain gmail.com is not allowed"

**Problem:**
```
Expected response code "250" but got code "550", with message
"550 5.7.1 Sending from domain gmail.com is not allowed"
```

**Cause:**
You're trying to send emails with `MAIL_FROM_ADDRESS` set to a `@gmail.com` (or other public domain) address. Mailtrap and most email providers don't allow this because you don't own those domains.

**Solution:**
Use a domain you control or Mailtrap's demo domain:

```env
# ✅ CORRECT - Use demomailtrap.com or your own domain
MAIL_FROM_ADDRESS="hello@demomailtrap.com"

# ✅ CORRECT - Use your own domain
MAIL_FROM_ADDRESS="noreply@yourdomain.com"

# ❌ WRONG - Don't use gmail.com, yahoo.com, etc.
MAIL_FROM_ADDRESS="kydnagpala.dev@gmail.com"
```

**Quick Fix:**
1. Edit `.env`:
   ```env
   MAIL_FROM_ADDRESS="hello@demomailtrap.com"
   ```

2. Clear config:
   ```bash
   php artisan config:clear
   ```

3. Try sending again

**Note:** The **recipient** email (`kydnagpala.dev@gmail.com`) is fine - this is who receives the email. The issue is only with the **sender** address.

---

### ❌ Emails Not Sending / Not Receiving

**Symptoms:**
- Queue worker processes job
- No errors shown
- Email never arrives in inbox

**Solutions:**

#### 1. Check Queue Worker is Running
```bash
# Check if running
ps aux | grep queue:work

# If not running, start it
php artisan queue:work
```

#### 2. Check for Failed Jobs
```bash
php artisan queue:failed
```

If you see failed jobs:
```bash
# Retry all failed jobs
php artisan queue:retry all

# Or flush failed jobs
php artisan queue:flush
```

#### 3. Check Logs
```bash
tail -50 storage/logs/laravel.log
```

Look for errors related to mail or SMTP.

#### 4. Verify Configuration
```bash
php artisan tinker
```

```php
echo "Mailer: " . config('mail.default');
echo "Host: " . config('mail.mailers.smtp.host');
echo "Port: " . config('mail.mailers.smtp.port');
echo "From: " . config('mail.from.address');
exit
```

Should show:
```
Mailer: smtp
Host: live.smtp.mailtrap.io
Port: 587
From: hello@demomailtrap.com
```

#### 5. Check Spam Folder
- Check your spam/junk folder
- Add `hello@demomailtrap.com` to your contacts

---

### ❌ "Connection refused" Error

**Error:**
```
Connection refused [tcp://live.smtp.mailtrap.io:587]
```

**Solutions:**

1. **Check Internet Connection**
   ```bash
   ping live.smtp.mailtrap.io
   ```

2. **Check Firewall**
   - Allow outbound connections on port 587
   - Disable firewall temporarily to test

3. **Try Different Port**
   ```env
   MAIL_PORT=2525
   ```

4. **Verify Mailtrap Status**
   - Go to https://mailtrap.io
   - Check if service is up

---

### ❌ "Authentication failed" Error

**Error:**
```
Failed to authenticate on SMTP server
```

**Solutions:**

1. **Verify API Token**
   ```env
   MAIL_PASSWORD=e196600feb3e584de5f603a1c0366d78
   ```
   Make sure this matches your Mailtrap API token.

2. **Check Username**
   ```env
   MAIL_USERNAME=api
   ```
   Should be exactly `api`, not your email.

3. **Clear Config**
   ```bash
   php artisan config:clear
   ```

---

### ❌ Verification Links Not Working

**Symptoms:**
- Click link in email
- Get error or "Invalid signature"
- Link doesn't verify email

**Solutions:**

#### 1. Check APP_URL
Your `APP_URL` must match your actual domain:

```env
# ✅ CORRECT for local development
APP_URL=http://ecommerce-starter-app.test

# ❌ WRONG if using ecommerce-starter-app.test
APP_URL=http://localhost
```

After changing:
```bash
php artisan config:clear
php artisan route:clear
```

#### 2. Check Link Expiration
Links expire in 60 minutes. If older, use resend:
- Go to: `/email/verify`
- Click "Resend Verification Email"

#### 3. Check Signature
If you get "Invalid signature":
```bash
# Clear route cache
php artisan route:clear

# Regenerate app key (WARNING: invalidates all existing links)
php artisan key:generate
```

---

### ❌ Queue Jobs Stuck

**Symptoms:**
- Jobs stay in `jobs` table
- Queue worker running but not processing
- Email never sent

**Solutions:**

1. **Restart Queue Worker**
   ```bash
   # Stop current worker (Ctrl+C)
   # Then start fresh
   php artisan queue:work
   ```

2. **Check Failed Jobs**
   ```bash
   php artisan queue:failed
   ```

3. **Clear Jobs Table**
   ```bash
   php artisan tinker
   DB::table('jobs')->delete();
   exit
   ```

4. **Process Stuck Jobs**
   ```bash
   php artisan queue:work --once
   ```

---

### ❌ Rate Limiting Errors

**Error:**
```
Too many attempts. Please try again in X seconds.
```

**Cause:**
You've exceeded the rate limit:
- **Resend:** 2 attempts per 5 minutes
- **Verification:** 6 attempts per minute

**Solution:**
Wait the specified time, or manually verify:

```bash
php artisan tinker
User::where('email', 'user@example.com')->update(['email_verified_at' => now()]);
exit
```

---

### ❌ "Class 'App\Mail\VerifyEmail' not found"

**Error:**
```
Class 'App\Mail\VerifyEmail' not found
```

**Solutions:**

1. **Run Composer Autoload**
   ```bash
   composer dump-autoload
   ```

2. **Check File Exists**
   ```bash
   ls app/Mail/VerifyEmail.php
   ```

3. **Check Namespace**
   File should start with:
   ```php
   namespace App\Mail;
   ```

---

### ❌ "Route [verification.verify] not defined"

**Error:**
```
Route [verification.verify] not defined
```

**Solutions:**

1. **Clear Route Cache**
   ```bash
   php artisan route:clear
   ```

2. **Verify Routes Exist**
   ```bash
   php artisan route:list | grep verification
   ```

   Should show:
   ```
   GET|HEAD  email/verify ............... verification.notice
   GET|HEAD  email/verify/{id}/{hash} .. verification.verify
   POST      email/verification-notification verification.send
   ```

3. **Check routes/web.php**
   Make sure verification routes are defined.

---

### ❌ Emails Going to Spam

**Solutions:**

1. **Add to Contacts**
   - Add `hello@demomailtrap.com` to your email contacts

2. **Mark as Not Spam**
   - Find email in spam folder
   - Mark as "Not Spam"

3. **Check SPF/DKIM** (Production)
   - Configure proper email authentication
   - Use a dedicated email service

---

## 🔍 Debugging Workflow

Follow this checklist when troubleshooting:

### Step 1: Check Configuration
```bash
php artisan config:clear
php artisan tinker
echo config('mail.from.address');
echo config('mail.mailers.smtp.host');
exit
```

### Step 2: Check Queue
```bash
# Is queue worker running?
ps aux | grep queue:work

# Any failed jobs?
php artisan queue:failed

# Jobs pending?
php artisan tinker
DB::table('jobs')->count();
exit
```

### Step 3: Check Logs
```bash
tail -100 storage/logs/laravel.log
```

### Step 4: Test Email Manually
```bash
php artisan tinker
```

```php
use Illuminate\Support\Facades\Mail;

Mail::raw('Test email', function($msg) {
    $msg->to('kydnagpala.dev@gmail.com')
        ->subject('Manual Test');
});

echo "Email queued!";
exit
```

Then process queue:
```bash
php artisan queue:work --once
```

### Step 5: Check Recipient
- Check inbox: `kydnagpala.dev@gmail.com`
- Check spam folder
- Wait a few minutes

---

## 📊 Verification Status

### Check if User is Verified
```bash
php artisan tinker
```

```php
$user = User::where('email', 'kydnagpala.dev@gmail.com')->first();
echo $user->email_verified_at ? "VERIFIED" : "NOT VERIFIED";
exit
```

### Manually Verify User (Development Only)
```bash
php artisan tinker
```

```php
User::where('email', 'kydnagpala.dev@gmail.com')
    ->update(['email_verified_at' => now()]);
echo "User verified!";
exit
```

### Check All Users
```bash
php artisan tinker
```

```php
echo "Verified: " . User::whereNotNull('email_verified_at')->count();
echo "Unverified: " . User::whereNull('email_verified_at')->count();
exit
```

---

## 🚨 Emergency Fixes

### Bypass Email Verification (Development Only)

**Option 1: Disable for Specific Route**
```php
// In routes/web.php, remove 'verified' middleware
Route::middleware(['auth'])->group(function () {
    // Routes without verification requirement
});
```

**Option 2: Verify All Users**
```bash
php artisan tinker
User::whereNull('email_verified_at')->update(['email_verified_at' => now()]);
exit
```

**Option 3: Switch to Log Driver**
```env
MAIL_MAILER=log
```

Then check `storage/logs/laravel.log` for emails.

---

## 📝 Checklist for Fresh Start

If nothing works, start fresh:

- [ ] Clear all caches
  ```bash
  php artisan config:clear
  php artisan cache:clear
  php artisan route:clear
  php artisan view:clear
  ```

- [ ] Check `.env` configuration
  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=live.smtp.mailtrap.io
  MAIL_PORT=587
  MAIL_USERNAME=api
  MAIL_PASSWORD=e196600feb3e584de5f603a1c0366d78
  MAIL_ENCRYPTION=tls
  MAIL_FROM_ADDRESS="hello@demomailtrap.com"
  APP_URL=http://ecommerce-starter-app.test
  ```

- [ ] Clear failed jobs
  ```bash
  php artisan queue:flush
  ```

- [ ] Restart queue worker
  ```bash
  php artisan queue:work
  ```

- [ ] Test with simple email
  ```bash
  php artisan tinker
  Mail::raw('Test', fn($m) => $m->to('kydnagpala.dev@gmail.com'));
  exit
  ```

- [ ] Check logs
  ```bash
  tail -f storage/logs/laravel.log
  ```

---

## 💡 Pro Tips

1. **Always clear config after .env changes**
   ```bash
   php artisan config:clear
   ```

2. **Keep queue worker running in development**
   ```bash
   php artisan queue:work
   ```

3. **Monitor logs in real-time**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Use Mailtrap inbox for debugging**
   - Login to https://mailtrap.io
   - View all sent emails
   - Check SMTP logs

5. **Don't use gmail.com as sender**
   - Always use: `hello@demomailtrap.com`
   - Or your own domain

---

## 📞 Still Having Issues?

1. **Check Documentation:**
   - [QUICK_START.md](QUICK_START.md)
   - [MAILTRAP_SETUP.md](MAILTRAP_SETUP.md)
   - [COMMANDS.md](COMMANDS.md)

2. **Check Laravel Logs:**
   ```bash
   storage/logs/laravel.log
   ```

3. **Check Laravel Documentation:**
   - https://laravel.com/docs/11.x/mail
   - https://laravel.com/docs/11.x/verification

4. **Check Mailtrap Status:**
   - https://mailtrap.io

---

**Last Updated:** December 15, 2025
**Common Issue:** Using `@gmail.com` as sender (Fixed: Use `hello@demomailtrap.com`)
