<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Service;
use App\Models\Client;
use App\Models\Consultant;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'service_id'    => Service::inRandomOrder()->value('id') ?? Service::factory(),
            'client_id'     => Client::inRandomOrder()->value('id') ?? Client::factory(),
            'consultant_id' => Consultant::inRandomOrder()->value('id') ?? Consultant::factory(),
            'status'        => $this->faker->randomElement(['pending','confirmed','completed','cancelled']),
            'date'          => $this->faker->dateTimeBetween('-15 days', '+15 days'),
            'notes'         => $this->faker->optional()->sentence(),
        ];
    }
}
