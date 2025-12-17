# Command Reference - Email Verification System

## 🚀 Quick Commands

### Start Testing (2 Terminals Required)

**Terminal 1: Application**
```bash
php artisan serve
```

**Terminal 2: Queue Worker**
```bash
php artisan queue:work
```

> **Important:** Keep both terminals running while testing!

---

## 📧 Essential Commands

### Clear Configuration Cache
```bash
php artisan config:clear
```
Run this after any `.env` changes.

### Clear All Caches
```bash
php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear
```

### Check Queue Status
```bash
# Show failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Flush failed jobs
php artisan queue:flush
```

### Process Queue (One-Time)
```bash
php artisan queue:work --once
```

### Process Queue Until Empty
```bash
php artisan queue:work --stop-when-empty
```

---

## 🔍 Debugging Commands

### Check Logs
```bash
# Real-time log monitoring
tail -f storage/logs/laravel.log

# Last 50 lines
tail -50 storage/logs/laravel.log

# Search for email logs
grep -i "mail\|email" storage/logs/laravel.log
```

### Test Email Configuration
```bash
php artisan tinker
```

Then in tinker:
```php
use Illuminate\Support\Facades\Mail;

Mail::raw('Test email', function($msg) {
    $msg->to('kydnagpala.dev@gmail.com')
        ->subject('Test Email');
});

// Check if queued
echo "Email queued!";
exit
```

### Check User Verification Status
```bash
php artisan tinker
```

```php
// Check specific user
User::where('email', 'kydnagpala.dev@gmail.com')->first()->email_verified_at;

// Check all unverified users
User::whereNull('email_verified_at')->get(['id', 'name', 'email']);

// Count verified vs unverified
echo "Verified: " . User::whereNotNull('email_verified_at')->count();
echo "Unverified: " . User::whereNull('email_verified_at')->count();
exit
```

### Manually Verify User (Dev Only)
```bash
php artisan tinker
```

```php
User::where('email', 'kydnagpala.dev@gmail.com')
    ->update(['email_verified_at' => now()]);

echo "User verified!";
exit
```

### Manually Unverify User (Testing)
```bash
php artisan tinker
```

```php
User::where('email', 'kydnagpala.dev@gmail.com')
    ->update(['email_verified_at' => null]);

echo "User unverified!";
exit
```

---

## 🗄️ Database Commands

### Check Jobs Table
```bash
php artisan tinker
```

```php
// Count pending jobs
DB::table('jobs')->count();

// Show pending jobs
DB::table('jobs')->get();

// Clear all jobs
DB::table('jobs')->delete();
exit
```

### Check Failed Jobs Table
```bash
php artisan tinker
```

```php
// Count failed jobs
DB::table('failed_jobs')->count();

// Show failed jobs
DB::table('failed_jobs')->get();
exit
```

---

## 🧪 Testing Workflow

### Complete Test Sequence

1. **Clear caches:**
```bash
php artisan config:clear
```

2. **Start application (Terminal 1):**
```bash
php artisan serve
```

3. **Start queue worker (Terminal 2):**
```bash
php artisan queue:work
```

4. **Register new user in browser:**
```
http://ecommerce-starter-app.test/register
```

5. **Check queue processing (Terminal 2):**
Watch for:
```
Processing: App\Listeners\SendEmailVerificationNotification
Processed:  App\Listeners\SendEmailVerificationNotification
```

6. **Check email:**
- Go to: `kydnagpala.dev@gmail.com`
- Look for: "Verify Your Email Address"

7. **Check logs:**
```bash
tail -20 storage/logs/laravel.log
```

---

## 🔧 Maintenance Commands

### Stop Queue Worker
```bash
# In Terminal 2 where queue:work is running
Ctrl + C
```

### Restart Queue Worker
```bash
php artisan queue:restart
```

### Clear Queue
```bash
php artisan queue:clear
```

### Monitor Queue in Real-Time
```bash
watch -n 1 "php artisan queue:failed && echo '---' && mysql -u root -plocalhost db_ecommerce_main -e 'SELECT COUNT(*) as pending FROM jobs'"
```

---

## 📊 Statistics Commands

### Email Statistics
```bash
php artisan tinker
```

```php
echo "Total Users: " . User::count();
echo "Verified: " . User::whereNotNull('email_verified_at')->count();
echo "Unverified: " . User::whereNull('email_verified_at')->count();
echo "Percentage Verified: " . round(User::whereNotNull('email_verified_at')->count() / User::count() * 100, 2) . "%";
exit
```

---

## 🚨 Emergency Commands

### Reset Email Verification for All Users (DANGEROUS!)
```bash
php artisan tinker
```

```php
// Mark all as verified
User::whereNull('email_verified_at')->update(['email_verified_at' => now()]);

// OR mark all as unverified
User::whereNotNull('email_verified_at')->update(['email_verified_at' => null]);
exit
```

### Clear All Queued Jobs
```bash
php artisan queue:clear
```

### Delete All Failed Jobs
```bash
php artisan queue:flush
```

---

## 🔄 Development Workflow

### Daily Startup
```bash
# Terminal 1
php artisan serve

# Terminal 2
php artisan queue:work

# Terminal 3 (for logs)
tail -f storage/logs/laravel.log
```

### After .env Changes
```bash
php artisan config:clear
php artisan cache:clear

# Restart queue worker (Ctrl+C in Terminal 2, then):
php artisan queue:work
```

### Before Committing Code
```bash
# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Run tests (if you have them)
php artisan test

# Check for failed jobs
php artisan queue:failed
```

---

## 📝 Custom Artisan Commands

### Create Test User with Verified Email
```bash
php artisan tinker
```

```php
User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);

echo "Test user created and verified!";
exit
```

### Send Test Verification Email
```bash
php artisan tinker
```

```php
use App\Mail\VerifyEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

$user = User::where('email', 'kydnagpala.dev@gmail.com')->first();

$verificationUrl = URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(60),
    ['id' => $user->id, 'hash' => sha1($user->email)]
);

Mail::to($user->email)->send(new VerifyEmail($verificationUrl, $user->name));

echo "Verification email sent!";
exit
```

---

## 🎯 Quick Troubleshooting Commands

### Problem: Emails not sending
```bash
# Check queue worker
ps aux | grep "queue:work"

# If not running, start it
php artisan queue:work

# Check for failed jobs
php artisan queue:failed

# Check logs
tail -f storage/logs/laravel.log
```

### Problem: Configuration not updating
```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Problem: Links not working
```bash
# Check APP_URL in .env
php artisan tinker
echo config('app.url');
exit

# Should match your local domain
# http://ecommerce-starter-app.test
```

---

## 📖 Help Commands

### Show All Routes
```bash
php artisan route:list
```

### Show Email Verification Routes Only
```bash
php artisan route:list | grep verification
```

### Show Queue Configuration
```bash
php artisan tinker
echo "Connection: " . config('queue.default');
echo "Table: jobs";
exit
```

### Show Mail Configuration
```bash
php artisan tinker
echo "Mailer: " . config('mail.default');
echo "Host: " . config('mail.mailers.smtp.host');
echo "Port: " . config('mail.mailers.smtp.port');
echo "From: " . config('mail.from.address');
exit
```

---

## 💡 Pro Tips

1. **Always run queue worker in development**
   ```bash
   php artisan queue:work
   ```

2. **Use `--stop-when-empty` for one-time processing**
   ```bash
   php artisan queue:work --stop-when-empty
   ```

3. **Monitor logs in real-time**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Clear cache after .env changes**
   ```bash
   php artisan config:clear
   ```

5. **Use tinker for quick tests**
   ```bash
   php artisan tinker
   ```

---

## 🎓 Learning Commands

### Explore Email Classes
```bash
php artisan tinker
```

```php
// Show mailable properties
$mail = new App\Mail\VerifyEmail('http://test.com', 'John Doe');
var_dump($mail);
exit
```

### Test Event Firing
```bash
php artisan tinker
```

```php
use Illuminate\Auth\Events\Registered;

$user = User::first();
event(new Registered($user));

echo "Registered event fired!";
exit
```

---

**Quick Reference Card:**

```bash
# Start
php artisan serve              # Terminal 1
php artisan queue:work         # Terminal 2

# Debug
tail -f storage/logs/laravel.log
php artisan queue:failed

# Clear
php artisan config:clear
php artisan cache:clear

# Test
php artisan tinker
Mail::raw('test', fn($m) => $m->to('email@test.com'));
```

---

**Last Updated:** December 15, 2025
**System:** Email Verification with Mailtrap
**Status:** Fully Operational
