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
use Illuminate\Support\Facades\DB;

echo "🔐 Activation du MFA pour tous les utilisateurs (SAUF ADMIN)\n";
echo "============================================================\n\n";
echo "ℹ️  Les administrateurs n'ont pas besoin de MFA - connexion directe\n\n";

// Statistiques (sauf admin - MFA non requis pour les admins)
$stats = [
    'client' => ['total' => 0, 'activated' => 0, 'already' => 0, 'failed' => 0],
    'manager' => ['total' => 0, 'activated' => 0, 'already' => 0, 'failed' => 0],
    'rh' => ['total' => 0, 'activated' => 0, 'already' => 0, 'failed' => 0],
    'comptable' => ['total' => 0, 'activated' => 0, 'already' => 0, 'failed' => 0],
    'consultant' => ['total' => 0, 'activated' => 0, 'already' => 0, 'failed' => 0],
];

// Modèles à traiter (sauf admin - MFA non requis pour les admins)
$models = [
    'client' => Client::class,
    'manager' => Manager::class,
    'rh' => Rh::class,
    'comptable' => Comptable::class,
    'consultant' => Consultant::class,
];

echo "📋 Traitement en cours...\n\n";

// Traiter chaque type d'utilisateur
foreach ($models as $type => $model) {
    echo "🔍 Traitement des {$type}s...\n";
    
    $users = $model::all();
    $stats[$type]['total'] = $users->count();
    
    foreach ($users as $user) {
        try {
            // Vérifier si MFA est déjà activé
            $setting = $user->twoFactorSetting()->first();
            
            if ($setting && $setting->enabled) {
                $stats[$type]['already']++;
                continue;
            }
            
            // Supprimer l'ancien setting s'il existe mais est désactivé
            if ($setting && !$setting->enabled) {
                $setting->delete();
            }
            
            // Créer un nouveau setting MFA activé
            $user->twoFactorSetting()->create([
                'channel' => 'email',
                'enabled' => true,
            ]);
            
            // Vérifier que le setting a été créé
            $newSetting = $user->twoFactorSetting()->first();
            if ($newSetting && $newSetting->enabled) {
                $stats[$type]['activated']++;
                
                $email = ($type === 'client') ? $user->contact_email : $user->email;
                echo "  ✅ MFA activé pour {$type} #{$user->id} ({$email})\n";
            } else {
                $stats[$type]['failed']++;
                $email = ($type === 'client') ? $user->contact_email : $user->email;
                echo "  ❌ Échec pour {$type} #{$user->id} ({$email})\n";
            }
        } catch (\Exception $e) {
            $stats[$type]['failed']++;
            $email = ($type === 'client') ? $user->contact_email : ($user->email ?? 'N/A');
            echo "  ❌ Erreur pour {$type} #{$user->id} ({$email}): {$e->getMessage()}\n";
        }
    }
    
    echo "\n";
}

// Afficher les statistiques
echo "📊 Statistiques\n";
echo "===============\n\n";

foreach ($stats as $type => $stat) {
    echo "{$type}s:\n";
    echo "  Total: {$stat['total']}\n";
    echo "  Déjà activé: {$stat['already']}\n";
    echo "  Nouvellement activé: {$stat['activated']}\n";
    echo "  Échecs: {$stat['failed']}\n";
    echo "\n";
}

$totalUsers = array_sum(array_column($stats, 'total'));
$totalActivated = array_sum(array_column($stats, 'activated'));
$totalAlready = array_sum(array_column($stats, 'already'));
$totalFailed = array_sum(array_column($stats, 'failed'));

echo "📈 Résumé global:\n";
echo "  Total utilisateurs: {$totalUsers}\n";
echo "  Déjà activé: {$totalAlready}\n";
echo "  Nouvellement activé: {$totalActivated}\n";
echo "  Échecs: {$totalFailed}\n";
echo "\n";

if ($totalFailed > 0) {
    echo "⚠️  Attention: {$totalFailed} utilisateur(s) n'ont pas pu être activés.\n";
    echo "   Vérifiez les logs ci-dessus pour plus de détails.\n\n";
} else {
    echo "✅ Tous les utilisateurs ont maintenant MFA activé!\n";
    echo "📧 Tous les utilisateurs recevront un code par email lors de la connexion.\n\n";
}

