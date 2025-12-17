<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Dashboard permissions
            [
                'name' => 'dashboard.view',
                'module' => 'dashboard',
                'action' => 'view',
                'display_name' => 'View Dashboard',
                'description' => 'Can view the dashboard',
            ],

            // Users permissions
            [
                'name' => 'users.view',
                'module' => 'users',
                'action' => 'view',
                'display_name' => 'View Users',
                'description' => 'Can view users list',
            ],
            [
                'name' => 'users.create',
                'module' => 'users',
                'action' => 'create',
                'display_name' => 'Create Users',
                'description' => 'Can create new users',
            ],
            [
                'name' => 'users.edit',
                'module' => 'users',
                'action' => 'edit',
                'display_name' => 'Edit Users',
                'description' => 'Can edit existing users',
            ],
            [
                'name' => 'users.delete',
                'module' => 'users',
                'action' => 'delete',
                'display_name' => 'Delete Users',
                'description' => 'Can delete users',
            ],

            // Roles permissions
            [
                'name' => 'roles.view',
                'module' => 'roles',
                'action' => 'view',
                'display_name' => 'View Roles',
                'description' => 'Can view roles list',
            ],
            [
                'name' => 'roles.create',
                'module' => 'roles',
                'action' => 'create',
                'display_name' => 'Create Roles',
                'description' => 'Can create new roles',
            ],
            [
                'name' => 'roles.edit',
                'module' => 'roles',
                'action' => 'edit',
                'display_name' => 'Edit Roles',
                'description' => 'Can edit existing roles',
            ],
            [
                'name' => 'roles.delete',
                'module' => 'roles',
                'action' => 'delete',
                'display_name' => 'Delete Roles',
                'description' => 'Can delete roles',
            ],

            // Permissions permissions
            [
                'name' => 'permissions.view',
                'module' => 'permissions',
                'action' => 'view',
                'display_name' => 'View Permissions',
                'description' => 'Can view permissions list',
            ],
            [
                'name' => 'permissions.create',
                'module' => 'permissions',
                'action' => 'create',
                'display_name' => 'Create Permissions',
                'description' => 'Can create new permissions',
            ],
            [
                'name' => 'permissions.edit',
                'module' => 'permissions',
                'action' => 'edit',
                'display_name' => 'Edit Permissions',
                'description' => 'Can edit existing permissions',
            ],
            [
                'name' => 'permissions.delete',
                'module' => 'permissions',
                'action' => 'delete',
                'display_name' => 'Delete Permissions',
                'description' => 'Can delete permissions',
            ],

            // Settings permissions
            [
                'name' => 'settings.view',
                'module' => 'settings',
                'action' => 'view',
                'display_name' => 'View Settings',
                'description' => 'Can view settings',
            ],
            [
                'name' => 'settings.edit',
                'module' => 'settings',
                'action' => 'edit',
                'display_name' => 'Edit Settings',
                'description' => 'Can edit settings',
            ],

            // Products permissions
            [
                'name' => 'products.view',
                'module' => 'products',
                'action' => 'view',
                'display_name' => 'View Products',
                'description' => 'Can view products list',
            ],
            [
                'name' => 'products.create',
                'module' => 'products',
                'action' => 'create',
                'display_name' => 'Create Products',
                'description' => 'Can create new products',
            ],
            [
                'name' => 'products.edit',
                'module' => 'products',
                'action' => 'edit',
                'display_name' => 'Edit Products',
                'description' => 'Can edit existing products',
            ],
            [
                'name' => 'products.delete',
                'module' => 'products',
                'action' => 'delete',
                'display_name' => 'Delete Products',
                'description' => 'Can delete products',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
