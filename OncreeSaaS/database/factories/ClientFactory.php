<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_name' => $this->faker->company(),
            'contact_name' => $this->faker->name(),
            'email'        => $this->faker->unique()->companyEmail(),
            'phone'        => $this->faker->phoneNumber(),
            'address'      => $this->faker->address(),
        ];
    }
}
