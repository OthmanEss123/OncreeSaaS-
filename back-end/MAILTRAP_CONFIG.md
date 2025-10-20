# Mailtrap Configuration for Email Password Reset

## Step 1: Get Mailtrap Credentials

1. Go to [https://mailtrap.io](https://mailtrap.io)
2. Create a free account
3. Go to "Email Testing" → "Inboxes"
4. Click on your inbox
5. Go to "SMTP Settings" tab
6. Copy your credentials

## Step 2: Update Your `.env` File

Add these lines to your `back-end/.env` file:

```env
# ==========================================
# MAILTRAP CONFIGURATION (for testing)
# ==========================================
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username_here
MAIL_PASSWORD=your_mailtrap_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@oncreesaas.com"
MAIL_FROM_NAME="OncreeSaaS"

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

**Replace:**
- `your_mailtrap_username_here` with your Mailtrap username (looks like: `1a2b3c4d5e6f7g`)
- `your_mailtrap_password_here` with your Mailtrap password (looks like: `9z8y7x6w5v4u3t`)

## Step 3: Run Migration

Run the migration to create the `password_resets` table:

```bash
cd back-end
php artisan migrate
```

## Step 4: Test the Email Flow

1. Start your Laravel server:
   ```bash
   php artisan serve
   ```

2. Start your Next.js frontend:
   ```bash
   cd frant-end
   npm run dev
   ```

3. Go to `http://localhost:3000/forgot-password`
4. Enter an email address that exists in your database
5. Check your Mailtrap inbox for the 6-digit code email
6. Enter the code and reset your password

## Production Configuration (Gmail Example)

For production, you can use Gmail or any other SMTP service:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@oncreesaas.com"
MAIL_FROM_NAME="OncreeSaaS"
```

**Note:** For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833):
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use that password in your `.env` file

## Troubleshooting

### Email not sending?

1. **Check your `.env` file** - Make sure all credentials are correct
2. **Clear config cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```
3. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Code not working?

- Codes expire after **15 minutes**
- Make sure you're using the most recent code
- Check that the email matches

### Testing in local development

In local development mode, the API will return the code in the response for easier testing:

```json
{
  "success": true,
  "message": "Code sent successfully",
  "code": "123456"  // Only in local mode
}
```

## API Endpoints

### 1. Send Reset Code
```
POST /api/forgot-password
Body: { "email": "user@example.com" }
```

### 2. Verify Code
```
POST /api/verify-code
Body: { "email": "user@example.com", "code": "123456" }
```

### 3. Reset Password
```
POST /api/reset-password
Body: {
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

## Security Features

✅ **6-digit codes** - Easy to type, secure enough for reset flows  
✅ **15-minute expiry** - Codes expire automatically  
✅ **One-time use** - Codes are deleted after successful reset  
✅ **Email verification** - Code must match the email  
✅ **All user types supported** - Works with Client, Manager, RH, Comptable, Consultant  

---

**Need help?** Check the Laravel logs or Mailtrap inbox for debugging.

