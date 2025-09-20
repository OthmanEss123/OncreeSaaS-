<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Invoice;
use App\Models\Client;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        Invoice::factory(15)->create();
        
        // Créer une facture spécifique
        $client = Client::first();
        if ($client) {
            Invoice::firstOrCreate(
                [
                    'client_id' => $client->id,
                    'amount' => 1600.00
                ],
                [
                    'client_id' => $client->id,
                    'status' => 'pending',
                    'amount' => 1600.00,
                    'due_date' => now()->addDays(30),
                ]
            );
        }
    }
}
