<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

echo "🔐 Ajout d'un administrateur - OncreeSaaS\n";
echo str_repeat('=', 60) . "\n\n";

$email = 'oncreesaas@gmail.com';
$password = 'oncree@123-saas';
$name = 'OncreeSaaS Admin';

// Vérifier si l'admin existe déjà
$existingAdmin = Admin::where('email', $email)->first();

if ($existingAdmin) {
    echo "⚠️  Un administrateur avec cet email existe déjà!\n";
    echo "   ID: {$existingAdmin->id}\n";
    echo "   Nom: {$existingAdmin->name}\n";
    echo "   Email: {$existingAdmin->email}\n";
    echo "   Créé le: {$existingAdmin->created_at}\n\n";
    
    echo "🔄 Mise à jour du mot de passe...\n";
    $existingAdmin->password = Hash::make($password);
    $existingAdmin->save();
    echo "✅ Mot de passe mis à jour avec succès!\n\n";
} else {
    echo "🚀 Création d'un nouvel administrateur...\n\n";
    
    try {
        $admin = Admin::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => null,
            'role' => 'Admin',
        ]);
        
        echo "✅ Administrateur créé avec succès!\n";
        echo "   ID: {$admin->id}\n";
        echo "   Nom: {$admin->name}\n";
        echo "   Email: {$admin->email}\n";
        echo "   Rôle: {$admin->role}\n";
        echo "   Créé le: {$admin->created_at}\n\n";
    } catch (\Exception $e) {
        echo "❌ Erreur lors de la création: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo str_repeat('=', 60) . "\n";
echo "📋 Informations de connexion:\n";
echo str_repeat('-', 60) . "\n";
echo "   Email: {$email}\n";
echo "   Mot de passe: {$password}\n";
echo str_repeat('=', 60) . "\n";
echo "✅ Opération terminée!\n\n";
