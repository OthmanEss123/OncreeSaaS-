<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Invoice;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::inRandomOrder()->value('id') ?? Invoice::factory(),
            'amount'     => $this->faker->randomFloat(2, 100, 2000),
            'method'     => $this->faker->randomElement(['virement','carte','espèces']),
            'date'       => $this->faker->dateTimeBetween('-30 days', 'now'),
            'status'     => $this->faker->randomElement(['confirmed','pending']),
        ];
    }
}
