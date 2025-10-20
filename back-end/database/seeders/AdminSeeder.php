<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un administrateur par défaut
        Admin::create([
            'name' => 'Super Admin',
            'email' => 'admin@oncreasaas.com',
            'phone' => '+33 1 00 00 00 00',
            'role' => 'Admin',
            'password' => Hash::make('Admin@2025'),
        ]);

        $this->command->info('Admin créé avec succès!');
        $this->command->info('Email: admin@oncreasaas.com');
        $this->command->info('Mot de passe: Admin@2025');
    }
}















