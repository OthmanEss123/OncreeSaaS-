<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title'       => $this->faker->randomElement(['Conseil IT','Développement','Audit','TMA']),
            'description' => $this->faker->sentence(8),
            'price'       => $this->faker->randomFloat(2, 50, 1200),
            'duration'    => $this->faker->numberBetween(30, 240), // minutes
            'active'      => $this->faker->boolean(90),
        ];
    }
}
