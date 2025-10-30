<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Rh;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

echo "🔍 Test du système RH - OncreeSaaS\n";
echo str_repeat('=', 60) . "\n\n";

// 1. Vérifier les comptes RH existants
echo "📋 Comptes RH dans la base de données:\n";
echo str_repeat('-', 60) . "\n";

$rhAccounts = Rh::with('client')->get();

if ($rhAccounts->isEmpty()) {
    echo "❌ Aucun compte RH trouvé dans la base de données!\n\n";
    echo "💡 Voulez-vous créer un compte RH de test? (Oui/Non)\n";
    echo "   Appuyez sur Entrée pour continuer...\n";
    
    // Pour l'automatisation, on va créer automatiquement
    echo "\n🚀 Création automatique d'un compte RH de test...\n\n";
    
    // Vérifier s'il y a des clients
    $client = Client::first();
    
    if (!$client) {
        echo "⚠️  Aucun client trouvé. Création d'un client test...\n";
        $client = Client::create([
            'company_name' => 'Entreprise Test',
            'contact_name' => 'Contact Test',
            'contact_email' => 'client@test.com',
            'contact_phone' => '0123456789',
            'address' => '123 Rue Test',
            'password' => Hash::make('password123')
        ]);
        echo "✅ Client créé: {$client->company_name}\n\n";
    }
    
    // Créer un compte RH
    $rh = Rh::create([
        'name' => 'RH Test',
        'email' => 'rh@test.com',
        'password' => Hash::make('password123'),
        'phone' => '0123456789',
        'client_id' => $client->id,
        'address' => '123 Rue Test'
    ]);
    
    echo "✅ Compte RH créé avec succès!\n";
    echo "   Email: rh@test.com\n";
    echo "   Mot de passe: password123\n";
    echo "   Client: {$client->company_name}\n\n";
    
    $rhAccounts = Rh::with('client')->get();
}

echo "📊 Total: " . $rhAccounts->count() . " compte(s) RH\n\n";

foreach ($rhAccounts as $index => $rh) {
    echo "👤 RH #" . ($index + 1) . ":\n";
    echo "   ID: {$rh->id}\n";
    echo "   Nom: {$rh->name}\n";
    echo "   Email: {$rh->email}\n";
    echo "   Téléphone: " . ($rh->phone ?: 'Non renseigné') . "\n";
    echo "   Client ID: {$rh->client_id}\n";
    
    if ($rh->client) {
        echo "   Client: {$rh->client->company_name}\n";
    } else {
        echo "   ⚠️  Client non trouvé!\n";
    }
    
    echo "   Créé le: {$rh->created_at}\n";
    echo "\n";
}

// 2. Tester l'authentification
echo str_repeat('=', 60) . "\n";
echo "🔐 Test d'authentification\n";
echo str_repeat('-', 60) . "\n\n";

$testRh = $rhAccounts->first();
if ($testRh) {
    echo "Test avec: {$testRh->email}\n";
    echo "Mot de passe test: password123\n\n";
    
    // Vérifier le hash du mot de passe
    if (Hash::check('password123', $testRh->password)) {
        echo "✅ Vérification du mot de passe: OK\n";
    } else {
        echo "❌ Vérification du mot de passe: ÉCHEC\n";
        echo "   Le mot de passe n'est pas 'password123'\n";
    }
    
    // Créer un token de test
    try {
        $token = $testRh->createToken('test-token')->plainTextToken;
        echo "✅ Création de token Sanctum: OK\n";
        echo "   Token: " . substr($token, 0, 20) . "...\n";
        
        // Nettoyer le token de test
        $testRh->tokens()->delete();
        echo "🧹 Token de test nettoyé\n";
    } catch (Exception $e) {
        echo "❌ Erreur lors de la création du token: " . $e->getMessage() . "\n";
    }
}

echo "\n";
echo str_repeat('=', 60) . "\n";
echo "✅ Test terminé!\n\n";

echo "🧪 Pour tester la connexion:\n";
echo "   1. Ouvrez: test-rh-login.html dans votre navigateur\n";
echo "   2. Utilisez les identifiants affichés ci-dessus\n";
echo "   3. Ou utilisez curl:\n\n";
echo "   curl -X POST https://api.saas.oncree.fr/api/login \\\n";
echo "        -H 'Content-Type: application/json' \\\n";
echo "        -d '{\"email\":\"rh@test.com\",\"password\":\"password123\"}'\n\n";















