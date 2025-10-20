<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Consultant;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class ConsultantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer le premier client
        $client = Client::first();
        
        if (!$client) {
            $this->command->error('Aucun client trouvé. Veuillez d\'abord exécuter ClientSeeder.');
            return;
        }

        // Créer des consultants de test
        $consultants = [
            [
                'name' => 'Marie Dubois',
                'email' => 'marie.dubois@example.com',
                'phone' => '+33 1 23 45 67 90',
                'role' => 'Consultant',
                'skills' => 'Design, UX/UI, Figma',
                'daily_rate' => 450,
                'status' => 'active',
                'client_id' => $client->id,
                'password' => Hash::make('password123'),
                'address' => '123 Rue de la Paix, 75001 Paris'
            ],
            [
                'name' => 'Jean Martin',
                'email' => 'jean.martin@example.com',
                'phone' => '+33 1 23 45 67 91',
                'role' => 'Consultant',
                'skills' => 'Développement, React, Node.js',
                'daily_rate' => 550,
                'status' => 'active',
                'client_id' => $client->id,
                'password' => Hash::make('password123'),
                'address' => '456 Avenue des Champs, 75008 Paris'
            ],
            [
                'name' => 'Sophie Laurent',
                'email' => 'sophie.laurent@example.com',
                'phone' => '+33 1 23 45 67 92',
                'role' => 'Consultant',
                'skills' => 'Gestion de projet, Agile, Scrum',
                'daily_rate' => 600,
                'status' => 'active',
                'client_id' => $client->id,
                'password' => Hash::make('password123'),
                'address' => '789 Boulevard Saint-Germain, 75006 Paris'
            ],
            [
                'name' => 'Pierre Moreau',
                'email' => 'pierre.moreau@example.com',
                'phone' => '+33 1 23 45 67 93',
                'role' => 'Consultant',
                'skills' => 'Analyse de données, Python, SQL',
                'daily_rate' => 400,
                'status' => 'inactive',
                'client_id' => $client->id,
                'password' => Hash::make('password123'),
                'address' => '321 Rue de Rivoli, 75001 Paris'
            ]
        ];

        foreach ($consultants as $consultantData) {
            Consultant::create($consultantData);
        }
    }
}













