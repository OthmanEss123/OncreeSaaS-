<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtenir les colonnes de la table consultants
$columns = Illuminate\Support\Facades\Schema::getColumnListing('consultants');
echo "Colonnes de la table consultants:\n";
echo json_encode($columns, JSON_PRETTY_PRINT) . "\n\n";

// Essayer de récupérer un comptable
try {
    $comptable = App\Models\Comptable::first();
    if ($comptable) {
        echo "Comptable trouvé:\n";
        echo "- ID: " . $comptable->id . "\n";
        echo "- Name: " . $comptable->name . "\n";
        echo "- Email: " . $comptable->email . "\n";
        echo "- Client ID: " . ($comptable->client_id ?? 'NULL') . "\n";
    } else {
        echo "Aucun comptable trouvé dans la base de données\n";
    }
} catch (Exception $e) {
    echo "Erreur lors de la récupération du comptable: " . $e->getMessage() . "\n";
}
























































