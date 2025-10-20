<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Manager;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class ManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les clients existants
        $trocair = Client::where('company_name', 'Trocair')->first();
        $techcorp = Client::where('company_name', 'TechCorp')->first();
        
        if (!$trocair || !$techcorp) {
            $this->command->error('Clients non trouvés. Veuillez d\'abord exécuter ClientSeeder.');
            return;
        }

        // Créer des managers de test
        $managers = [
            [
                'name' => 'Pierre Manager',
                'email' => 'pierre.manager@trocair.com',
                'phone' => '+33 1 23 45 67 89',
                'role' => 'Manager',
                'client_id' => $trocair->id,
                'password' => Hash::make('password123'),
                'address' => '123 Rue de la Paix, 75001 Paris, France'
            ],
            [
                'name' => 'Sophie Manager',
                'email' => 'sophie.manager@techcorp.com',
                'phone' => '+33 1 98 76 54 32',
                'role' => 'Manager',
                'client_id' => $techcorp->id,
                'password' => Hash::make('password123'),
                'address' => '456 Avenue des Champs, 75008 Paris, France'
            ]
        ];

        foreach ($managers as $managerData) {
            Manager::create($managerData);
        }

        $this->command->info('Managers créés avec succès!');
    }
}











