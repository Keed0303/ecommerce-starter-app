<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .email-body {
            padding: 40px 30px;
        }
        .email-body h2 {
            color: #333333;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .email-body p {
            color: #666666;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .verify-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .expiration-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .expiration-notice p {
            margin: 0;
            color: #856404;
            font-size: 14px;
        }
        .alternative-link {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .alternative-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        .alternative-link a {
            color: #667eea;
            word-break: break-all;
            font-size: 12px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .email-footer p {
            color: #6c757d;
            font-size: 14px;
            margin: 5px 0;
        }
        .security-tips {
            background-color: #e7f3ff;
            border-left: 4px solid #0066cc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-tips h3 {
            margin: 0 0 10px 0;
            color: #0066cc;
            font-size: 16px;
        }
        .security-tips ul {
            margin: 0;
            padding-left: 20px;
            color: #004080;
            font-size: 14px;
        }
        .security-tips li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Welcome to {{ config('app.name') }}</h1>
        </div>

        <div class="email-body">
            <h2>Hello {{ $userName }}!</h2>

            <p>Thank you for creating an account with us. We're excited to have you on board!</p>

            <p>To complete your registration and start using all features, please verify your email address by clicking the button below:</p>

            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="verify-button">Verify Email Address</a>
            </div>

            <div class="expiration-notice">
                <p><strong>⏰ Important:</strong> This verification link will expire in 60 minutes for security reasons.</p>
            </div>

            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
            </div>

            <div class="security-tips">
                <h3>🔒 Security Tips</h3>
                <ul>
                    <li>This link is unique to your account and should not be shared with anyone</li>
                    <li>If you didn't create an account, you can safely ignore this email</li>
                    <li>Never share your password or verification links</li>
                </ul>
            </div>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

            <p>Best regards,<br>The {{ config('app.name') }} Team</p>
        </div>

        <div class="email-footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
