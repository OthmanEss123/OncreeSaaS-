<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Client;
use App\Models\Consultant;
use App\Models\Rh;
use App\Models\Manager;
use App\Models\Comptable;
use App\Models\Admin;
use App\Models\TwoFactorSetting;

echo "🔐 Activation du MFA pour un utilisateur\n";
echo "=========================================\n\n";

// Demander l'email de l'utilisateur (ligne de commande ou interactif)
$email = $argv[1] ?? null;

if (!$email) {
    echo "Entrez l'email de l'utilisateur: ";
    $email = trim(fgets(STDIN));
}

// Chercher l'utilisateur dans toutes les tables
$user = null;
$userType = null;

// Vérifier dans chaque table
$models = [
    'admin' => Admin::class,
    'client' => Client::class,
    'manager' => Manager::class,
    'rh' => Rh::class,
    'comptable' => Comptable::class,
    'consultant' => Consultant::class,
];

foreach ($models as $type => $model) {
    $emailField = ($type === 'client') ? 'contact_email' : 'email';
    $user = $model::where($emailField, $email)->first();
    if ($user) {
        $userType = $type;
        echo "✅ Utilisateur trouvé: {$type}\n";
        break;
    }
}

if (!$user) {
    echo "❌ Aucun utilisateur trouvé avec cet email.\n";
    exit(1);
}

// Vérifier si MFA est déjà activé
$setting = $user->twoFactorSetting()->first();

if ($setting && $setting->enabled) {
    echo "⚠️  MFA est déjà activé pour cet utilisateur.\n";
    echo "Voulez-vous le désactiver puis le réactiver? (o/n): ";
    $response = trim(fgets(STDIN));
    
    if (strtolower($response) !== 'o') {
        echo "❌ Opération annulée.\n";
        exit(0);
    }
    
    $setting->delete();
}

// Créer le paramètre MFA en utilisant la relation morphique
$user->twoFactorSetting()->create([
    'channel' => 'email',
    'enabled' => true,
]);

// Vérifier que le setting a été créé
$newSetting = $user->twoFactorSetting()->first();
if (!$newSetting || !$newSetting->enabled) {
    echo "❌ Erreur: Le paramètre MFA n'a pas pu être créé correctement.\n";
    exit(1);
}

echo "✅ MFA activé avec succès pour l'utilisateur!\n";
echo "📧 L'utilisateur recevra un code par email lors de la connexion.\n\n";
echo "💡 Pour tester:\n";
echo "   1. Connectez-vous avec cet utilisateur\n";
echo "   2. Vérifiez l'email pour le code à 6 chiffres\n";
echo "   3. Entrez le code sur la page MFA\n";


