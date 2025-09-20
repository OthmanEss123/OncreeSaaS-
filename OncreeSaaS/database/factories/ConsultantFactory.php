<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class ConsultantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'       => User::inRandomOrder()->value('id') ?? User::factory(),
            'contract_type' => $this->faker->randomElement(['CDI','CDD','Freelance']),
            'tjm'           => $this->faker->randomFloat(2, 300, 900),
            'availability'  => $this->faker->boolean(80),
        ];
    }
}
