<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prospect;

class ProspectSeeder extends Seeder
{
    public function run(): void
    {
        Prospect::factory(10)->create();
    }
}
