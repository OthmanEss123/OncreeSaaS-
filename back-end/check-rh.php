<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 Vérification du compte RH...\n\n";

$rh = \App\Models\Rh::where('email', 'othmanrayb@gmail.com')->first();

if ($rh) {
    echo "✅ RH trouvé:\n";
    echo "   Nom: " . $rh->name . "\n";
    echo "   Email: " . $rh->email . "\n";
    echo "   ID: " . $rh->id . "\n";
    echo "   Client ID: " . ($rh->client_id ?? 'NULL - ATTENTION!') . "\n";
    
    if ($rh->client_id) {
        $client = \App\Models\Client::find($rh->client_id);
        if ($client) {
            echo "   Client: " . $client->company_name . "\n";
        } else {
            echo "   ⚠️  WARNING: Client ID existe mais client non trouvé!\n";
        }
    } else {
        echo "\n❌ PROBLÈME: Ce RH n'a pas de client_id!\n";
        echo "   Le dashboard RH ne fonctionnera pas.\n";
    }
} else {
    echo "❌ ERREUR: Compte RH non trouvé!\n";
    echo "\nPour créer le compte, exécutez:\n";
    echo "php artisan tinker\n";
    echo "puis:\n";
    echo "\App\Models\Rh::create(['name' => 'Othman Rayb', 'email' => 'othmanrayb@gmail.com', 'password' => bcrypt('password123'), 'client_id' => 1]);\n";
}

echo "\n";

