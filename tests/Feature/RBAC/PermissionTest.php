<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->role = Role::factory()->create();
});

// ============================================
// AUTHENTICATION & AUTHORIZATION TESTS
// ============================================

test('guests are redirected to login when accessing permissions', function () {
    $this->get(route('permissions.index'))->assertRedirect(route('login'));
});

test('users without permission cannot access permissions index', function () {
    $this->actingAs($this->user)
        ->get(route('permissions.index'))
        ->assertStatus(403);
});

test('users with permission can access permissions index', function () {
    $permission = Permission::where('name', 'permissions.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('permissions.index'))
        ->assertOk();
});

// ============================================
// PERMISSION LISTING TESTS
// ============================================

test('permissions index shows paginated list', function () {
    $permission = Permission::where('name', 'permissions.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)->get(route('permissions.index'));

    $response->assertOk();
    $permissions = $response->viewData('page')['props']['permissions'];
    expect($permissions['per_page'])->toBe(15); // 15 per page
});

test('permissions are sorted by module and action', function () {
    $permission = Permission::where('name', 'permissions.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)->get(route('permissions.index'));

    $permissions = $response->viewData('page')['props']['permissions'];
    $firstPermission = $permissions['data'][0];
    expect(isset($firstPermission['module']))->toBeTrue();
    expect(isset($firstPermission['action']))->toBeTrue();
});

// ============================================
// PERMISSION CREATION TESTS
// ============================================

test('users can create a permission', function () {
    $createPermission = Permission::where('name', 'permissions.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = [
        'name' => 'test.create',
        'module' => 'test',
        'action' => 'create',
        'display_name' => 'Create Test',
        'description' => 'Can create test items',
    ];

    $this->actingAs($this->user)
        ->post(route('permissions.store'), $data)
        ->assertRedirect(route('permissions.index'));

    $this->assertDatabaseHas('permissions', [
        'name' => 'test.create',
        'module' => 'test',
        'action' => 'create',
    ]);
});

test('permission name must be unique', function () {
    $existingPermission = Permission::first();

    $createPermission = Permission::where('name', 'permissions.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('permissions.store'), [
            'name' => $existingPermission->name,
            'module' => 'test',
            'action' => 'test',
            'display_name' => 'Test',
        ])
        ->assertSessionHasErrors('name');
});

test('permission requires all required fields', function () {
    $createPermission = Permission::where('name', 'permissions.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('permissions.store'), [])
        ->assertSessionHasErrors(['name', 'module', 'action', 'display_name']);
});

test('permission description is optional', function () {
    $createPermission = Permission::where('name', 'permissions.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('permissions.store'), [
            'name' => 'test.view',
            'module' => 'test',
            'action' => 'view',
            'display_name' => 'View Test',
        ])
        ->assertRedirect(route('permissions.index'));

    $this->assertDatabaseHas('permissions', [
        'name' => 'test.view',
        'description' => null,
    ]);
});

test('permission follows naming convention module.action', function () {
    $createPermission = Permission::where('name', 'permissions.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('permissions.store'), [
            'name' => 'products.edit',
            'module' => 'products',
            'action' => 'edit',
            'display_name' => 'Edit Products',
        ]);

    $permission = Permission::where('name', 'products.edit')->first();
    expect($permission)->not->toBeNull();
    expect($permission->module)->toBe('products');
    expect($permission->action)->toBe('edit');
});

// ============================================
// PERMISSION UPDATE TESTS
// ============================================

test('users can update a permission', function () {
    $permission = Permission::where('name', 'products.view')->first();

    $editPermission = Permission::where('name', 'permissions.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('permissions.update', $permission), [
            'name' => $permission->name,
            'module' => $permission->module,
            'action' => $permission->action,
            'display_name' => 'Updated Display Name',
            'description' => 'Updated description',
        ])
        ->assertRedirect(route('permissions.index'));

    expect($permission->fresh()->display_name)->toBe('Updated Display Name');
    expect($permission->fresh()->description)->toBe('Updated description');
});

test('permission name uniqueness is checked on update', function () {
    $permission1 = Permission::where('name', 'products.view')->first();
    $permission2 = Permission::where('name', 'products.create')->first();

    $editPermission = Permission::where('name', 'permissions.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('permissions.update', $permission1), [
            'name' => $permission2->name, // Try to use existing name
            'module' => 'products',
            'action' => 'view',
            'display_name' => 'Test',
        ])
        ->assertSessionHasErrors('name');
});

// ============================================
// PERMISSION DELETION TESTS
// ============================================

test('can delete permission not assigned to any role', function () {
    $permission = Permission::create([
        'name' => 'test.delete',
        'module' => 'test',
        'action' => 'delete',
        'display_name' => 'Delete Test',
    ]);

    $deletePermission = Permission::where('name', 'permissions.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('permissions.destroy', $permission))
        ->assertRedirect(route('permissions.index'));

    $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
});

test('cannot delete permission assigned to roles', function () {
    $permission = Permission::where('name', 'users.view')->first();
    $this->role->permissions()->attach($permission->id);

    $deletePermission = Permission::where('name', 'permissions.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('permissions.destroy', $permission))
        ->assertRedirect();

    $this->assertDatabaseHas('permissions', ['id' => $permission->id]);
});

// ============================================
// PERMISSION EDIT TESTS
// ============================================

test('users can view permission edit page', function () {
    $permission = Permission::first();
    $editPermission = Permission::where('name', 'permissions.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('permissions.edit', $permission));

    $response->assertOk();
    $permissionData = $response->viewData('page')['props']['permission'];
    expect($permissionData['id'])->toBe($permission->id);
});

// ============================================
// PERMISSION MODEL TESTS
// ============================================

test('permission has module index for optimization', function () {
    $permission = Permission::first();
    expect($permission->getConnection()->getSchemaBuilder()->hasIndex('permissions', ['module']))->toBeTrue();
});

test('permission belongs to many roles', function () {
    $permission = Permission::create([
        'name' => 'test.permission',
        'module' => 'test',
        'action' => 'permission',
        'display_name' => 'Test Permission',
    ]);
    $roles = Role::factory()->count(2)->create();
    $permission->roles()->attach($roles->pluck('id'));

    expect($permission->fresh()->roles)->toHaveCount(2);
});

test('permission seeder creates all required permissions', function () {
    // Check that all module permissions exist
    $modules = ['dashboard', 'users', 'roles', 'permissions', 'products', 'categories'];
    $actions = ['view', 'create', 'edit', 'delete'];

    foreach ($modules as $module) {
        if ($module === 'dashboard') {
            expect(Permission::where('name', 'dashboard.view')->exists())->toBeTrue();
        } else {
            foreach ($actions as $action) {
                $permissionName = "{$module}.{$action}";
                expect(Permission::where('name', $permissionName)->exists())->toBeTrue();
            }
        }
    }
});
