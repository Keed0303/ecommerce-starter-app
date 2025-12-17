<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->role = Role::factory()->create();
    $this->permission = Permission::where('name', 'roles.view')->first();
});

// ============================================
// AUTHENTICATION & AUTHORIZATION TESTS
// ============================================

test('guests are redirected to login when accessing roles', function () {
    $this->get(route('roles.index'))->assertRedirect(route('login'));
});

test('users without permission cannot access roles index', function () {
    $this->actingAs($this->user)
        ->get(route('roles.index'))
        ->assertStatus(403);
});

test('users with permission can access roles index', function () {
    $this->role->permissions()->attach($this->permission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('roles.index'))
        ->assertOk();
});

// ============================================
// ROLE LISTING TESTS
// ============================================

test('roles index shows paginated list of roles', function () {
    $role = Role::factory()->create();
    $createPermission = Permission::where('name', 'roles.view')->first();
    $role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($role->id);

    Role::factory()->count(15)->create();

    $response = $this->actingAs($this->user)->get(route('roles.index'));

    $response->assertOk();
    $roles = $response->viewData('page')['props']['roles'];
    expect($roles['per_page'])->toBe(10);
});

test('roles index shows user count for each role', function () {
    $role = Role::factory()->create(['name' => 'Test Role']);
    User::factory()->count(5)->create()->each(function ($user) use ($role) {
        $user->roles()->attach($role->id);
    });

    $viewPermission = Permission::where('name', 'roles.view')->first();
    $role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($role->id);

    $response = $this->actingAs($this->user)->get(route('roles.index'));

    $response->assertOk();
    $roles = $response->viewData('page')['props']['roles'];
    $testRole = collect($roles['data'])->firstWhere('name', 'Test Role');
    expect($testRole['users_count'])->toBe(6); // 5 + the authenticated user
});

// ============================================
// ROLE CREATION TESTS
// ============================================

test('users can create a role with permissions', function () {
    $createPermission = Permission::where('name', 'roles.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $permissions = Permission::take(3)->pluck('id')->toArray();

    $data = [
        'name' => 'New Test Role',
        'description' => 'Test description',
        'permissions' => $permissions,
        'moduleOrder' => [
            ['module' => 'dashboard', 'order' => 1],
            ['module' => 'users', 'order' => 2],
        ],
    ];

    $this->actingAs($this->user)
        ->post(route('roles.store'), $data)
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseHas('roles', [
        'name' => 'New Test Role',
        'description' => 'Test description',
    ]);

    $role = Role::where('name', 'New Test Role')->first();
    expect($role->permissions)->toHaveCount(3);
});

test('role name must be unique', function () {
    Role::factory()->create(['name' => 'Existing Role']);

    $createPermission = Permission::where('name', 'roles.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'Existing Role',
            'permissions' => [1],
            'moduleOrder' => [],
        ])
        ->assertSessionHasErrors('name');
});

test('role requires at least one permission', function () {
    $createPermission = Permission::where('name', 'roles.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'New Role',
            'permissions' => [],
            'moduleOrder' => [],
        ])
        ->assertSessionHasErrors('permissions');
});

test('role name is required', function () {
    $createPermission = Permission::where('name', 'roles.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => '',
            'permissions' => [1],
            'moduleOrder' => [],
        ])
        ->assertSessionHasErrors('name');
});

test('module order is saved when creating role', function () {
    $createPermission = Permission::where('name', 'roles.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = [
        'name' => 'Role With Order',
        'description' => 'Test description',
        'permissions' => [1],
        'moduleOrder' => [
            ['module' => 'dashboard', 'order' => 1],
            ['module' => 'products', 'order' => 2],
        ],
    ];

    $this->actingAs($this->user)
        ->post(route('roles.store'), $data)
        ->assertRedirect(route('roles.index'));

    $role = Role::where('name', 'Role With Order')->first();
    expect($role->moduleOrder)->toHaveCount(2);
    expect($role->moduleOrder->first()->module)->toBe('dashboard');
    expect($role->moduleOrder->first()->order)->toBe(1);
});

// ============================================
// ROLE UPDATE TESTS
// ============================================

test('users can update a role', function () {
    $role = Role::factory()->create(['name' => 'Old Name']);
    $editPermission = Permission::where('name', 'roles.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $newPermissions = Permission::take(2)->pluck('id')->toArray();

    $this->actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'permissions' => $newPermissions,
            'moduleOrder' => [
                ['module' => 'dashboard', 'order' => 1],
            ],
        ])
        ->assertRedirect(route('roles.index'));

    expect($role->fresh()->name)->toBe('Updated Name');
    expect($role->fresh()->description)->toBe('Updated description');
    expect($role->fresh()->permissions)->toHaveCount(2);
});

test('updating role syncs permissions', function () {
    $role = Role::factory()->create();
    $initialPermissions = Permission::take(3)->get();
    $role->permissions()->attach($initialPermissions->pluck('id'));

    $editPermission = Permission::where('name', 'roles.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $newPermissions = Permission::skip(3)->take(2)->pluck('id')->toArray();

    $this->actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => $role->name,
            'description' => $role->description,
            'permissions' => $newPermissions,
            'moduleOrder' => [
                ['module' => 'dashboard', 'order' => 1],
            ],
        ]);

    expect($role->fresh()->permissions)->toHaveCount(2);
    expect($role->fresh()->permissions->pluck('id')->sort()->values()->toArray())->toBe(collect($newPermissions)->sort()->values()->toArray());
});

test('updating role syncs module order', function () {
    $role = Role::factory()->create();
    $editPermission = Permission::where('name', 'roles.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => $role->name,
            'description' => $role->description,
            'permissions' => [1],
            'moduleOrder' => [
                ['module' => 'users', 'order' => 1],
                ['module' => 'roles', 'order' => 2],
            ],
        ]);

    expect($role->fresh()->moduleOrder)->toHaveCount(2);
});

// ============================================
// ROLE DELETION TESTS
// ============================================

test('can delete role without users', function () {
    $role = Role::factory()->create();
    $deletePermission = Permission::where('name', 'roles.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('roles.destroy', $role))
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

test('cannot delete role with assigned users', function () {
    $role = Role::factory()->create();
    User::factory()->create()->roles()->attach($role->id);

    $deletePermission = Permission::where('name', 'roles.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('roles.destroy', $role))
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['id' => $role->id]);
});

// ============================================
// ROLE EDIT TESTS
// ============================================

test('users can view role edit page', function () {
    $role = Role::factory()->create();
    $editPermission = Permission::where('name', 'roles.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('roles.edit', $role));

    $response->assertOk();
    $roleData = $response->viewData('page')['props']['role'];
    expect($roleData['id'])->toBe($role->id);
});

test('role edit page displays permissions grouped by module', function () {
    $role = Role::factory()->create();
    $permissions = Permission::take(5)->get();
    $role->permissions()->attach($permissions->pluck('id'));

    $editPermission = Permission::where('name', 'roles.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('roles.edit', $role));

    $response->assertOk();
    $roleData = $response->viewData('page')['props']['role'];
    expect(count($roleData['permissions']))->toBe(5);
});

// ============================================
// ROLE FACTORY TESTS
// ============================================

test('role factory creates valid role', function () {
    $role = Role::factory()->create([
        'name' => 'Factory Role',
        'description' => 'Created by factory',
    ]);

    expect($role->name)->toBe('Factory Role');
    expect($role->description)->toBe('Created by factory');
    $this->assertDatabaseHas('roles', ['name' => 'Factory Role']);
});
