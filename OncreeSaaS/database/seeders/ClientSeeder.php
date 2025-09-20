<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        Client::factory(10)->create();
        Client::firstOrCreate(
            ['email' => 'client1@oncree.com'],
            [
                'company_name' => 'Entreprise ABC',
                'contact_name' => 'Jean Dupont',
                'email' => 'client1@oncree.com',
                'phone' => '0600000000',
                'address' => '123 Rue de la Paix, Paris',
            ]
        );

        Client::firstOrCreate(
            ['email' => 'client2@oncree.com'],
            [
                'company_name' => 'Société XYZ',
                'contact_name' => 'Marie Martin',
                'email' => 'client2@oncree.com',
                'phone' => '0700000000',
                'address' => '456 Avenue des Champs, Lyon',
            ]
        );
    }
}
