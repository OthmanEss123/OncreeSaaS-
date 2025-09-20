<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Consultant;

class ConsultantSeeder extends Seeder
{
    public function run(): void
    {
        Consultant::factory(8)->create();
    }
}
