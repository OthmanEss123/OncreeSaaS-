<?php

/**
 * Script pour réenvoyer manuellement l'email du CRA signé
 * 
 * Usage: php resend-cra-email.php <consultant_id> <month> <year>
 * Exemple: php resend-cra-email.php 10 1 2026
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CraSignature;
use Illuminate\Support\Facades\Log;

// Vérifier les arguments
if ($argc < 4) {
    echo "❌ Usage: php resend-cra-email.php <consultant_id> <month> <year>\n";
    echo "   Exemple: php resend-cra-email.php 10 1 2026\n";
    exit(1);
}

$consultantId = (int)$argv[1];
$month = (int)$argv[2];
$year = (int)$argv[3];

echo "📧 Réenvoi de l'email CRA signé\n";
echo "================================\n\n";
echo "Consultant ID: $consultantId\n";
echo "Mois: $month\n";
echo "Année: $year\n\n";

// Récupérer la signature
$craSignature = CraSignature::where('consultant_id', $consultantId)
    ->where('month', $month)
    ->where('year', $year)
    ->first();

if (!$craSignature) {
    echo "❌ CRA non trouvé pour cette période\n";
    exit(1);
}

// Vérifier que toutes les signatures sont présentes
$hasConsultant = !empty($craSignature->consultant_signature_data);
$hasClient = !empty($craSignature->client_signature_data);
$hasManager = !empty($craSignature->manager_signature_data);

echo "📋 Statut des signatures:\n";
echo "   Consultant: " . ($hasConsultant ? "✅" : "❌") . "\n";
echo "   Client: " . ($hasClient ? "✅" : "❌") . "\n";
echo "   Manager: " . ($hasManager ? "✅" : "❌") . "\n\n";

if (!$hasConsultant || !$hasClient || !$hasManager) {
    echo "❌ Toutes les signatures ne sont pas présentes. Email non envoyé.\n";
    exit(1);
}

// Réenvoyer l'email via le contrôleur
$controller = new \App\Http\Controllers\WorkScheduleController();
$request = new \Illuminate\Http\Request([
    'consultant_id' => $consultantId,
    'month' => $month,
    'year' => $year
]);

try {
    echo "📤 Envoi de l'email...\n";
    $response = $controller->resendSignedCRAEmail($request);
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "✅ Email envoyé avec succès!\n";
        echo "📬 Vérifiez l'email du client dans votre configuration Mailtrap ou serveur SMTP.\n";
    } else {
        echo "❌ Erreur: " . $data['message'] . "\n";
        exit(1);
    }
} catch (\Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "\n📋 Vérifiez:\n";
    echo "1. La configuration email dans .env (MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD)\n";
    echo "2. Les logs dans storage/logs/laravel.log\n";
    exit(1);
}



