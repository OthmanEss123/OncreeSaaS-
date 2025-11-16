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

echo "🔍 Vérification du statut MFA\n";
echo "=============================\n\n";

// Demander l'email de l'utilisateur (ligne de commande ou interactif)
$email = $argv[1] ?? null;

if (!$email) {
    echo "Entrez l'email de l'utilisateur: ";
    $email = trim(fgets(STDIN));
}

// Chercher l'utilisateur dans toutes les tables
$user = null;
$userType = null;

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
        echo "✅ Utilisateur trouvé: {$type} (ID: {$user->id})\n";
        break;
    }
}

if (!$user) {
    echo "❌ Aucun utilisateur trouvé avec cet email.\n";
    exit(1);
}

// Vérifier le statut MFA
$setting = $user->twoFactorSetting()->first();

echo "\n📋 Statut MFA:\n";
echo "   - Setting existe: " . ($setting ? "Oui" : "Non") . "\n";

if ($setting) {
    echo "   - ID: {$setting->id}\n";
    echo "   - Channel: {$setting->channel}\n";
    echo "   - Enabled: " . ($setting->enabled ? "Oui" : "Non") . "\n";
    echo "   - MFAable Type: {$setting->mfaable_type}\n";
    echo "   - MFAable ID: {$setting->mfaable_id}\n";
    echo "   - Créé le: {$setting->created_at}\n";
    echo "   - Modifié le: {$setting->updated_at}\n";
    
    if ($setting->enabled) {
        echo "\n✅ MFA est ACTIVÉ pour cet utilisateur.\n";
        echo "   Lors de la connexion, l'utilisateur devrait recevoir un code par email.\n";
    } else {
        echo "\n⚠️  MFA est DÉSACTIVÉ pour cet utilisateur.\n";
        echo "   Pour l'activer, exécutez: php enable-mfa.php\n";
    }
} else {
    echo "\n❌ Aucun paramètre MFA trouvé pour cet utilisateur.\n";
    echo "   Pour activer MFA, exécutez: php enable-mfa.php\n";
}

// Vérifier directement dans la base de données
echo "\n📊 Vérification directe dans la base de données:\n";
$dbSetting = TwoFactorSetting::where('mfaable_type', get_class($user))
    ->where('mfaable_id', $user->id)
    ->first();

if ($dbSetting) {
    echo "   ✅ Paramètre trouvé directement dans la DB\n";
    echo "   - Enabled: " . ($dbSetting->enabled ? "Oui" : "Non") . "\n";
} else {
    echo "   ❌ Aucun paramètre trouvé directement dans la DB\n";
}

