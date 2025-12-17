<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->role = Role::factory()->create();
    $this->permission = Permission::where('name', 'users.view')->first();
});

// ============================================
// AUTHENTICATION & AUTHORIZATION TESTS
// ============================================

test('guests are redirected to login when accessing users', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('users without permission cannot access users index', function () {
    $this->actingAs($this->user)
        ->get(route('users.index'))
        ->assertStatus(403);
});

test('users with permission can access users index', function () {
    $this->role->permissions()->attach($this->permission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('users.index'))
        ->assertOk();
});

// ============================================
// USER LISTING TESTS
// ============================================

test('users index shows paginated list of users', function () {
    $this->role->permissions()->attach($this->permission->id);
    $this->user->roles()->attach($this->role->id);

    User::factory()->count(15)->create();

    $response = $this->actingAs($this->user)->get(route('users.index'));

    $response->assertOk();
    $users = $response->viewData('page')['props']['users'];
    expect($users['per_page'])->toBe(10); // 10 per page
});

// ============================================
// USER CREATION TESTS
// ============================================

test('users can create a new user with roles', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $testRole = Role::factory()->create();

    $data = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'roles' => [$testRole->id],
    ];

    $this->actingAs($this->user)
        ->post(route('users.store'), $data)
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    $newUser = User::where('email', 'test@example.com')->first();
    expect($newUser->roles)->toHaveCount(1);
});

test('user email must be unique', function () {
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);

    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('email');
});

test('user password must be at least 8 characters', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
        ->assertSessionHasErrors('password');
});

test('user password must be confirmed', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])
        ->assertSessionHasErrors('password');
});

test('user requires name and email', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors(['name', 'email']);
});

test('user can be created without roles', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertRedirect(route('users.index'));

    $newUser = User::where('email', 'test@example.com')->first();
    expect($newUser->roles)->toHaveCount(0);
});

test('user password is hashed when creating', function () {
    $createPermission = Permission::where('name', 'users.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('users.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $newUser = User::where('email', 'test@example.com')->first();
    expect($newUser->password)->not->toBe('password123');
    expect(\Hash::check('password123', $newUser->password))->toBeTrue();
});

// ============================================
// USER UPDATE TESTS
// ============================================

test('users can update user details', function () {
    $targetUser = User::factory()->create();
    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => 'Updated Name',
            'email' => $targetUser->email,
        ])
        ->assertRedirect(route('users.index'));

    expect($targetUser->fresh()->name)->toBe('Updated Name');
});

test('user email uniqueness is checked on update', function () {
    $targetUser = User::factory()->create();
    $otherUser = User::factory()->create(['email' => 'other@example.com']);

    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => $targetUser->name,
            'email' => 'other@example.com',
        ])
        ->assertSessionHasErrors('email');
});

test('user can keep their own email on update', function () {
    $targetUser = User::factory()->create(['email' => 'user@example.com']);
    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => 'Updated Name',
            'email' => 'user@example.com',
        ])
        ->assertRedirect(route('users.index'));

    expect($targetUser->fresh()->email)->toBe('user@example.com');
});

test('user password is optional on update', function () {
    $targetUser = User::factory()->create();
    $originalPassword = $targetUser->password;

    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => 'Updated Name',
            'email' => $targetUser->email,
        ])
        ->assertRedirect(route('users.index'));

    expect($targetUser->fresh()->password)->toBe($originalPassword);
});

test('user password is updated when provided', function () {
    $targetUser = User::factory()->create();
    $originalPassword = $targetUser->password;

    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => $targetUser->name,
            'email' => $targetUser->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])
        ->assertRedirect(route('users.index'));

    expect($targetUser->fresh()->password)->not->toBe($originalPassword);
    expect(\Hash::check('newpassword123', $targetUser->fresh()->password))->toBeTrue();
});

test('updating user syncs roles', function () {
    $targetUser = User::factory()->create();
    $initialRole = Role::factory()->create();
    $targetUser->roles()->attach($initialRole->id);

    $editPermission = Permission::where('name', 'users.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $newRole = Role::factory()->create();

    $this->actingAs($this->user)
        ->put(route('users.update', $targetUser), [
            'name' => $targetUser->name,
            'email' => $targetUser->email,
            'roles' => [$newRole->id],
        ])
        ->assertRedirect(route('users.index'));

    expect($targetUser->fresh()->roles)->toHaveCount(1);
    expect($targetUser->fresh()->roles->first()->id)->toBe($newRole->id);
});

// ============================================
// USER DELETION TESTS
// ============================================

test('users can delete other users', function () {
    $targetUser = User::factory()->create();
    $deletePermission = Permission::where('name', 'users.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('users.destroy', $targetUser))
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
});

test('users cannot delete themselves', function () {
    $deletePermission = Permission::where('name', 'users.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('users.destroy', $this->user))
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['id' => $this->user->id]);
});

// ============================================
// USER VIEW TESTS
// ============================================

test('users can view user details', function () {
    $targetUser = User::factory()->create();
    $viewPermission = Permission::where('name', 'users.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('users.show', $targetUser))
        ->assertOk();
});

test('user show page displays user roles', function () {
    $targetUser = User::factory()->create();
    $roles = Role::factory()->count(3)->create();
    $targetUser->roles()->attach($roles->pluck('id'));

    $viewPermission = Permission::where('name', 'users.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('users.show', $targetUser));

    $response->assertOk();
    $userData = $response->viewData('page')['props']['user'];
    expect(count($userData['roles']))->toBe(3);
});

// ============================================
// USER MODEL TESTS
// ============================================

test('user belongs to many roles', function () {
    $roles = Role::factory()->count(3)->create();
    $this->user->roles()->attach($roles->pluck('id'));

    expect($this->user->fresh()->roles)->toHaveCount(3);
});

test('user hasPermission method works correctly', function () {
    $permission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    expect($this->user->hasPermission('products.create'))->toBeTrue();
    expect($this->user->hasPermission('nonexistent.permission'))->toBeFalse();
});

test('user hasRole method works correctly', function () {
    $this->role->update(['name' => 'Admin']);
    $this->user->roles()->attach($this->role->id);

    expect($this->user->hasRole('Admin'))->toBeTrue();
    expect($this->user->hasRole('NonExistentRole'))->toBeFalse();
});

test('user getAllPermissions returns unique permissions from all roles', function () {
    $role1 = Role::factory()->create();
    $role2 = Role::factory()->create();

    $permission1 = Permission::where('name', 'users.view')->first();
    $permission2 = Permission::where('name', 'roles.view')->first();
    $permission3 = Permission::where('name', 'permissions.view')->first();

    $role1->permissions()->attach([$permission1->id, $permission2->id]);
    $role2->permissions()->attach([$permission2->id, $permission3->id]);

    $this->user->roles()->attach([$role1->id, $role2->id]);

    $permissions = $this->user->getAllPermissions();

    expect($permissions)->toHaveCount(3);
    expect($permissions)->toContain('users.view');
    expect($permissions)->toContain('roles.view');
    expect($permissions)->toContain('permissions.view');
});

test('user getModuleOrder returns empty array when no roles', function () {
    expect($this->user->getModuleOrder())->toBe([]);
});

test('user getModuleOrder returns module order from first role', function () {
    $this->user->roles()->attach($this->role->id);

    $this->role->moduleOrder()->createMany([
        ['module' => 'dashboard', 'order' => 1],
        ['module' => 'users', 'order' => 2],
        ['module' => 'products', 'order' => 3],
    ]);

    $moduleOrder = $this->user->getModuleOrder();

    expect($moduleOrder)->toHaveCount(3);
    expect($moduleOrder[0])->toBe(['module' => 'dashboard', 'order' => 1]);
    expect($moduleOrder[1])->toBe(['module' => 'users', 'order' => 2]);
    expect($moduleOrder[2])->toBe(['module' => 'products', 'order' => 3]);
});

test('user password is automatically hashed', function () {
    $user = User::factory()->create([
        'password' => 'plaintextpassword',
    ]);

    expect($user->password)->not->toBe('plaintextpassword');
});
