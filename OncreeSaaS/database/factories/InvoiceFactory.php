<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Client;
use App\Models\Mission;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $created = $this->faker->dateTimeBetween('-45 days', 'now');
        return [
            'client_id'  => Client::inRandomOrder()->value('id') ?? Client::factory(),
            'mission_id' => Mission::inRandomOrder()->value('id') ?? Mission::factory(),
            'amount'     => $this->faker->randomFloat(2, 600, 6000),
            'status'     => 'pending',
            'due_date'   => (clone $created)->modify('+15 days')->format('Y-m-d'),
            'pdf_path'   => null,
            'created_at' => $created,
            'updated_at' => $created,
        ];
    }
}
