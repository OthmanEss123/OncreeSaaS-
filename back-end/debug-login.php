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

echo "🔍 Debug Login - Vérification MFA\n";
echo "==================================\n\n";

// Demander l'email
$email = $argv[1] ?? null;

if (!$email) {
    echo "Usage: php debug-login.php email@example.com\n";
    echo "Ou entrez l'email: ";
    $email = trim(fgets(STDIN));
}

echo "📧 Email: {$email}\n\n";

// Chercher l'utilisateur
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
        echo "✅ Utilisateur trouvé:\n";
        echo "   - Type: {$type}\n";
        echo "   - ID: {$user->id}\n";
        echo "   - Email: " . ($user->email ?? $user->contact_email ?? 'N/A') . "\n";
        break;
    }
}

if (!$user) {
    echo "❌ Aucun utilisateur trouvé avec cet email.\n";
    exit(1);
}

// Vérifier le MFA
echo "\n🔐 Vérification MFA:\n";
$setting = $user->twoFactorSetting()->first();

if (!$setting) {
    echo "   ❌ Aucun paramètre MFA trouvé\n";
    echo "   → L'utilisateur sera connecté DIRECTEMENT sans MFA\n";
    echo "\n💡 Solution: Activer MFA avec:\n";
    echo "   php enable-mfa.php {$email}\n";
} else {
    echo "   ✅ Paramètre MFA trouvé:\n";
    echo "   - ID: {$setting->id}\n";
    echo "   - Channel: {$setting->channel}\n";
    echo "   - Enabled: " . ($setting->enabled ? "Oui ✅" : "Non ❌") . "\n";
    
    if ($setting->enabled) {
        echo "   → L'utilisateur devra passer par MFA lors de la connexion\n";
    } else {
        echo "   ⚠️  MFA est DÉSACTIVÉ\n";
        echo "   → L'utilisateur sera connecté DIRECTEMENT sans MFA\n";
        echo "\n💡 Solution: Réactiver MFA avec:\n";
        echo "   php enable-mfa.php {$email}\n";
    }
}

// Vérifier directement dans la DB
echo "\n📊 Vérification directe dans la DB:\n";
$dbSetting = TwoFactorSetting::where('mfaable_type', get_class($user))
    ->where('mfaable_id', $user->id)
    ->first();

if ($dbSetting) {
    echo "   ✅ Trouvé dans la DB:\n";
    echo "   - mfaable_type: {$dbSetting->mfaable_type}\n";
    echo "   - mfaable_id: {$dbSetting->mfaable_id}\n";
    echo "   - enabled: " . ($dbSetting->enabled ? "true" : "false") . "\n";
} else {
    echo "   ❌ Non trouvé dans la DB\n";
}

// Simuler le comportement du login
echo "\n🎯 Comportement attendu lors du login:\n";
if ($setting && $setting->enabled) {
    echo "   1. ✅ Vérification du mot de passe\n";
    echo "   2. ✅ MFA activé → Génération du code\n";
    echo "   3. ✅ Envoi du code par email\n";
    echo "   4. ✅ Retour: mfa_required: true\n";
    echo "   5. ✅ Redirection vers /mfa\n";
} else {
    echo "   1. ✅ Vérification du mot de passe\n";
    echo "   2. ❌ MFA non activé\n";
    echo "   3. ✅ Retour: mfa_required: false\n";
    echo "   4. ✅ Connexion DIRECTE (pas de MFA)\n";
    echo "   5. ✅ Redirection vers /client/dashboard\n";
}

echo "\n";









