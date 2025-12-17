<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->timestamps();
        });

        // Seed permissions directly in migration
        $permissions = [
            ['name' => 'categories.view', 'module' => 'categories', 'action' => 'view', 'display_name' => 'View Categories', 'description' => 'Can view categories list and details'],
            ['name' => 'categories.create', 'module' => 'categories', 'action' => 'create', 'display_name' => 'Create Categories', 'description' => 'Can create new categories'],
            ['name' => 'categories.edit', 'module' => 'categories', 'action' => 'edit', 'display_name' => 'Edit Categories', 'description' => 'Can edit existing categories'],
            ['name' => 'categories.delete', 'module' => 'categories', 'action' => 'delete', 'display_name' => 'Delete Categories', 'description' => 'Can delete categories'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission['name']],
                array_merge($permission, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // Assign permissions to Super Admin role
        $superAdminRole = DB::table('roles')->where('name', 'Super Admin')->first();
        if ($superAdminRole) {
            $permissionIds = DB::table('permissions')
                ->whereIn('name', array_column($permissions, 'name'))
                ->pluck('id');

            foreach ($permissionIds as $permissionId) {
                DB::table('role_permission')->updateOrInsert([
                    'role_id' => $superAdminRole->id,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove permissions
        DB::table('permissions')->whereIn('name', [
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',
        ])->delete();

        Schema::dropIfExists('categories');
    }
};
