<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            ConsultantSeeder::class,
            ClientSeeder::class,
            ProspectSeeder::class,
            ServiceSeeder::class,
            AppointmentSeeder::class,
            MissionSeeder::class,
            InvoiceSeeder::class,
            QuoteSeeder::class,
            PaymentSeeder::class,
            TimeTrackingSeeder::class,
            NotificationSeeder::class,
            AbsenceSeeder::class,
        ]);
    }
}
