<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@oncree.local'],
            [
                'name' => 'Admin',
                'email' => 'admin@oncree.local',
                'password' => Hash::make('password'),
                'role_id' => Role::where('name', 'admin')->first()->id ?? 1,
            ]
        );

        User::factory(10)->create();
    }
}
