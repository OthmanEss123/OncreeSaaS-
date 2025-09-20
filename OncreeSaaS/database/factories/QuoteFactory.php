<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Client;
use App\Models\Mission;

class QuoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id'  => Client::inRandomOrder()->value('id') ?? Client::factory(),
            'mission_id' => Mission::inRandomOrder()->value('id') ?? Mission::factory(),
            'amount'     => $this->faker->randomFloat(2, 500, 5000),
            'status'     => $this->faker->randomElement(['draft','sent','accepted','rejected']),
        ];
    }
}
