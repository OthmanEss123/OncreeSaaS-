<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un client de test
        Client::create([
            'company_name' => 'Trocair',
            'contact_name' => 'Jean Dupont',
            'contact_email' => 'jean.dupont@trocair.com',
            'contact_phone' => '+33 1 23 45 67 89',
            'role' => 'Client',
            'password' => Hash::make('password123'),
            'address' => '123 Rue de la Paix, 75001 Paris, France'
        ]);

        // Créer un autre client de test
        Client::create([
            'company_name' => 'TechCorp',
            'contact_name' => 'Marie Martin',
            'contact_email' => 'marie.martin@techcorp.com',
            'contact_phone' => '+33 1 98 76 54 32',
            'role' => 'Client',
            'password' => Hash::make('password123'),
            'address' => '456 Avenue des Champs, 75008 Paris, France'
        ]);
    }
}













