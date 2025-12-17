# 📧 Complete Mailtrap Setup Guide

## 🎯 What You Need

You need **Mailtrap Sandbox credentials** (NOT the API token you have).

## 📝 Step-by-Step Setup

### **Step 1: Get Mailtrap Sandbox Credentials**

1. **Go to:** https://mailtrap.io/signin
2. **Login** to your Mailtrap account
3. **Go to:** "Email Testing" → "Inboxes"
   Direct link: https://mailtrap.io/inboxes

4. **You'll see your inbox(es)** - Click on one (or create new)

5. **Look for "SMTP Settings"** dropdown at the top

6. **Select Integration:** "Laravel 9+"

7. **You'll see credentials like this:**
   ```
   Username: 1a2b3c4d5e6f7g
   Password: 9h8i7j6k5l4m3n
   ```

### **Step 2: Screenshot of Where to Find It**

When you're in your inbox, you'll see:

```
┌─────────────────────────────────────────┐
│  My Inbox                    🔽 SMTP Settings │
├─────────────────────────────────────────┤
│                                         │
│  Select Integration: [Laravel 9+  ▼]   │
│                                         │
│  Host: sandbox.smtp.mailtrap.io         │
│  Port: 2525                             │
│  Username: abc123def456                 │  ← COPY THIS
│  Password: xyz789ghi012                 │  ← COPY THIS
│  Auth: PLAIN, LOGIN and CRAM-MD5        │
│  TLS: Optional (STARTTLS on all ports)  │
│                                         │
└─────────────────────────────────────────┘
```

### **Step 3: Update config/mail.php**

Once you have the credentials, I'll update your configuration.

**For now, tell me:**
- ✅ Did you get the Username?
- ✅ Did you get the Password?

Then I'll configure it for you!

---

## 🤔 FAQ

### Q: What's the difference between the API token and Sandbox credentials?

**API Token (`e196600feb3e584de5f603a1c0366d78`):**
- Used for Mailtrap **Live SMTP** (production sending)
- Requires domain verification
- Actually delivers emails to real inboxes

**Sandbox Credentials (username/password):**
- Used for **testing** emails
- No domain verification needed
- Emails are **trapped** in Mailtrap (not delivered)
- Perfect for development!

### Q: Which one should I use?

For **development/testing:** Use **Sandbox** (what we're setting up now)
For **production:** Use **Live SMTP** with verified domain

### Q: What domain should I use?

For **Sandbox testing:** Any domain works! Use `noreply@yourapp.com`
For **Live SMTP:** Must be a domain you own and verify

---

## 📸 Visual Guide

### Finding Your Inbox Credentials

1️⃣ **Login to Mailtrap** → https://mailtrap.io

2️⃣ **Click "Email Testing"** in left sidebar

3️⃣ **Click "Inboxes"**

4️⃣ **Select your inbox** (usually named "My Inbox" or "Demo inbox")

5️⃣ **Click dropdown: "SMTP Settings"**

6️⃣ **Select: "Laravel 9+"** from integration dropdown

7️⃣ **Copy the Username and Password**

---

## 🔄 What Happens Next

Once you provide the credentials:

1. I'll update `config/mail.php` with your Sandbox settings
2. Clear all caches
3. Test sending an email
4. You'll see the email in your Mailtrap inbox!

---

## 💡 Alternative: Keep Using Log Driver

If you just want to see emails in logs (current setup), you can keep using:

```bash
# Just run this and check logs
php artisan queue:work

# In another terminal
tail -f storage/logs/laravel.log
```

This works perfectly for testing! Emails appear in the log file.

---

**Ready? Get your Sandbox credentials and let me know!** 🚀
