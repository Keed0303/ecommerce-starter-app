<?php

use Database\Seeders\PermissionSeeder;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Seed permissions
        (new PermissionSeeder())->run();

        // Seed super admin user with all permissions
        (new SuperAdminSeeder())->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse seeding
        // Users, roles, and permissions can be managed through the application
    }
};
