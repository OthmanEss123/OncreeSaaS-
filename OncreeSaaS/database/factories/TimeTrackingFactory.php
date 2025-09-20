<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Mission;
use App\Models\Consultant;

class TimeTrackingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'mission_id'    => Mission::inRandomOrder()->value('id') ?? Mission::factory(),
            'consultant_id' => Consultant::inRandomOrder()->value('id') ?? Consultant::factory(),
            'hours'         => $this->faker->randomFloat(2, 1, 8),
            'date'          => $this->faker->dateTimeBetween('-30 days', 'now'),
            'notes'         => $this->faker->optional()->sentence(),
        ];
    }
}
