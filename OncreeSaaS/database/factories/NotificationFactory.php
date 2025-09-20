<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class NotificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->value('id') ?? User::factory(),
            'type'    => $this->faker->randomElement(['email','push']),
            'message' => $this->faker->sentence(8),
            'status'  => $this->faker->randomElement(['unread','read']),
        ];
    }
}
