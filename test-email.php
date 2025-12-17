<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;

echo "Sending test email...\n";

Mail::raw('This is a test email from your Laravel application!', function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email from Laravel');
});

echo "✅ Email queued/sent successfully!\n";
echo "Check your Mailtrap inbox at: https://mailtrap.io/inboxes\n";
