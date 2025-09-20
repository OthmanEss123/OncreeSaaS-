<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProspectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_name' => $this->faker->company(),
            'contact_name' => $this->faker->name(),
            'email'        => $this->faker->optional()->companyEmail(),
            'phone'        => $this->faker->optional()->phoneNumber(),
            'status'       => $this->faker->randomElement(['new','contacted','converted']),
        ];
    }
}
