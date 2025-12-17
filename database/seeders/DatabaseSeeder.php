<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed permissions first
        $this->call(PermissionSeeder::class);

        // Seed super admin user with all permissions
        $this->call(SuperAdminSeeder::class);

        // Optionally seed dashboard data
        // $this->call(DashboardSeeder::class);
    }
}
