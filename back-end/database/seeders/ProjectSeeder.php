<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Client;

class ProjectSeeder extends Seeder
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

        // Créer des projets de test
        $projects = [
            [
                'client_id' => $client->id,
                'name' => 'Refonte E-commerce',
                'description' => 'Refonte complète de la plateforme e-commerce avec nouvelle interface utilisateur',
                'start_date' => '2024-01-15',
                'end_date' => '2024-03-15'
            ],
            [
                'client_id' => $client->id,
                'name' => 'Développement Application Mobile',
                'description' => 'Création d\'une application mobile native pour iOS et Android',
                'start_date' => '2024-02-01',
                'end_date' => null // Projet en cours
            ],
            [
                'client_id' => $client->id,
                'name' => 'Analyse de Données',
                'description' => 'Analyse des données clients et création de tableaux de bord',
                'start_date' => '2023-12-01',
                'end_date' => '2024-01-31'
            ],
            [
                'client_id' => $client->id,
                'name' => 'Migration Cloud',
                'description' => 'Migration de l\'infrastructure vers le cloud AWS',
                'start_date' => null, // Projet en attente
                'end_date' => null
            ]
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }
    }
}













