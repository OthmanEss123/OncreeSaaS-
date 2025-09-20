<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Client;
use App\Models\Consultant;
use App\Models\Service;

class MissionFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-2 months', '+1 month');
        $end   = (clone $start)->modify('+'.rand(15,90).' days');

        return [
            'client_id'     => Client::inRandomOrder()->value('id') ?? Client::factory(),
            'consultant_id' => Consultant::inRandomOrder()->value('id') ?? Consultant::factory(),
            'service_id'    => Service::inRandomOrder()->value('id') ?? Service::factory(),
            'start_date'    => $start->format('Y-m-d'),
            'end_date'      => $end->format('Y-m-d'),
            'status'        => $this->faker->randomElement(['ongoing','completed','cancelled']),
        ];
    }
}
