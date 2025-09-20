<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Absence;
use App\Models\Consultant;

class AbsenceFactory extends Factory
{
    protected $model = Absence::class;

    public function definition()
    {
        return [
            'consultant_id' => Consultant::factory(),
            'start_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+1 day', '+2 months'),
            'type' => $this->faker->randomElement(['vacation', 'sick', 'other']),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
        ];
    }
}
