<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 Test d'envoi d'email\n";
echo "======================\n\n";

// Test 1: Configuration
echo "📧 Configuration Mail:\n";
echo "Host: " . config('mail.mailers.smtp.host') . "\n";
echo "Port: " . config('mail.mailers.smtp.port') . "\n";
echo "Username: " . config('mail.mailers.smtp.username') . "\n";
echo "From: " . config('mail.from.address') . "\n\n";

// Test 2: Envoi d'email
echo "📤 Test d'envoi...\n";

try {
    \Illuminate\Support\Facades\Mail::send('emails.reset-code', [
        'code' => '123456',
        'userName' => 'Test User',
        'expiresIn' => '15 minutes'
    ], function ($message) {
        $message->to('test@example.com')
                ->subject('Test - Code de réinitialisation');
    });
    
    echo "✅ Email envoyé avec succès!\n";
    echo "📬 Vérifiez votre inbox Mailtrap: https://mailtrap.io/inboxes\n";
    
} catch (\Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n\n";
    echo "📋 Solution:\n";
    echo "1. Vérifiez vos credentials Mailtrap dans .env\n";
    echo "2. Allez sur https://mailtrap.io et copiez vos vrais identifiants\n";
    echo "3. Mettez à jour MAIL_USERNAME et MAIL_PASSWORD\n";
    echo "4. Exécutez: php artisan config:clear\n";
}




















