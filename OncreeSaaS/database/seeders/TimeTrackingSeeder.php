<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TimeTracking;

class TimeTrackingSeeder extends Seeder
{
    public function run(): void
    {
        TimeTracking::factory(30)->create();
    }
}
