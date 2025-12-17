<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin Role
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'Super Admin'],
            ['description' => 'Has full access to all system features and permissions']
        );

        // Get all permissions
        $allPermissions = Permission::all();

        // Attach all permissions to Super Admin role
        $superAdminRole->permissions()->sync($allPermissions->pluck('id'));

        // Create Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign Super Admin role to user
        $superAdmin->roles()->sync([$superAdminRole->id]);

        // Only output messages if command is available (running from artisan)
        if ($this->command) {
            $this->command->info('Super Admin user created successfully!');
            $this->command->info('Email: admin@example.com');
            $this->command->info('Password: password');
            $this->command->warn('Please change the password after first login!');
        }
    }
}
