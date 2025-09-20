<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'description' => 'Administrateur du système'],
            ['name' => 'manager', 'description' => 'Manager des missions et équipes'],
            ['name' => 'consultant', 'description' => 'Consultant sur missions'],
            ['name' => 'client', 'description' => 'Client de la plateforme'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']], 
                $role
            );
        }
    }
}
