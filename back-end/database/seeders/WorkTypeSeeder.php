<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WorkType;

class WorkTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workTypes = [
            [
                'name' => 'Temps plein',
                'code' => 'FULL_TIME',
                'description' => 'Travail à temps plein (8h/jour)',
                'is_active' => true,
                'multiplier' => 1.00,
                'requires_approval' => false
            ],
            [
                'name' => 'Temps partiel',
                'code' => 'PART_TIME',
                'description' => 'Travail à temps partiel',
                'is_active' => true,
                'multiplier' => 1.00,
                'requires_approval' => false
            ],
            [
                'name' => 'Heures supplémentaires',
                'code' => 'OVERTIME',
                'description' => 'Heures supplémentaires (majorées)',
                'is_active' => true,
                'multiplier' => 1.50,
                'requires_approval' => true
            ],
            [
                'name' => 'Weekend',
                'code' => 'WEEKEND',
                'description' => 'Travail le weekend',
                'is_active' => true,
                'multiplier' => 1.25,
                'requires_approval' => true
            ],
            [
                'name' => 'Formation',
                'code' => 'TRAINING',
                'description' => 'Heures de formation',
                'is_active' => true,
                'multiplier' => 1.00,
                'requires_approval' => true
            ]
        ];

        foreach ($workTypes as $workType) {
            WorkType::create($workType);
        }
    }
}
