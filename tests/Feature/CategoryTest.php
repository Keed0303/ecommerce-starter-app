<?php

use App\Models\Category;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->role = Role::factory()->create();
});

// ============================================
// AUTHENTICATION & AUTHORIZATION TESTS
// ============================================

test('guests are redirected to login when accessing categories', function () {
    $this->get(route('categories.index'))->assertRedirect(route('login'));
});

test('users without permission cannot access categories index', function () {
    $this->actingAs($this->user)
        ->get(route('categories.index'))
        ->assertStatus(403);
});

test('users with permission can access categories index', function () {
    $permission = Permission::where('name', 'categories.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('categories.index'))
        ->assertOk();
});

// ============================================
// CATEGORY LISTING TESTS
// ============================================

test('categories index shows paginated list', function () {
    $permission = Permission::where('name', 'categories.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    Category::factory()->count(15)->create();

    $response = $this->actingAs($this->user)->get(route('categories.index'));

    $response->assertOk();
    $categories = $response->viewData('page')['props']['categories'];
    expect($categories['per_page'])->toBe(10);
});

test('categories index loads parent and children relationships', function () {
    $permission = Permission::where('name', 'categories.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $parent = Category::factory()->create();
    $child = Category::factory()->withParent($parent->id)->create();

    $response = $this->actingAs($this->user)->get(route('categories.index'));

    $response->assertOk();
    $categories = $response->viewData('page')['props']['categories'];
    $parentInList = collect($categories['data'])->firstWhere('id', $parent->id);
    expect($parentInList['children'])->not->toBeNull();
});

// ============================================
// CATEGORY CREATION TESTS
// ============================================

test('users can create a category with all fields', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = [
        'name' => 'Test Category',
        'description' => 'Test Description',
        'is_active' => true,
        'slug' => 'custom-slug',
    ];

    $this->actingAs($this->user)
        ->post(route('categories.store'), $data)
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Test Category',
        'slug' => 'custom-slug',
        'is_active' => true,
    ]);
});

test('slug is auto-generated from name if not provided', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = ['name' => 'Electronics & Gadgets'];

    $this->actingAs($this->user)->post(route('categories.store'), $data);

    $this->assertDatabaseHas('categories', [
        'name' => 'Electronics & Gadgets',
        'slug' => 'electronics-gadgets',
    ]);
});

test('category can have a parent category', function () {
    $parent = Category::factory()->create(['name' => 'Parent']);
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = [
        'name' => 'Child Category',
        'parent_id' => $parent->id,
    ];

    $this->actingAs($this->user)->post(route('categories.store'), $data);

    $child = Category::where('name', 'Child Category')->first();
    expect($child->parent_id)->toBe($parent->id);
    expect($child->parent->name)->toBe('Parent');
});

test('category name must be unique', function () {
    Category::factory()->create(['name' => 'Existing Category']);
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), ['name' => 'Existing Category'])
        ->assertSessionHasErrors('name');
});

test('category slug must be unique', function () {
    Category::factory()->create(['name' => 'Test', 'slug' => 'test-slug']);
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), [
            'name' => 'Different Name',
            'slug' => 'test-slug',
        ])
        ->assertSessionHasErrors('slug');
});

test('category name is required', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), [])
        ->assertSessionHasErrors('name');
});

test('category description is optional', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), ['name' => 'Test'])
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Test',
        'description' => null,
    ]);
});

test('category is_active defaults to true', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), ['name' => 'Test'])
        ->assertRedirect(route('categories.index'));

    $category = Category::where('name', 'Test')->first();
    expect($category->is_active)->toBeTrue();
});

test('category parent must exist', function () {
    $createPermission = Permission::where('name', 'categories.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('categories.store'), [
            'name' => 'Test',
            'parent_id' => 99999,
        ])
        ->assertSessionHasErrors('parent_id');
});

// ============================================
// CATEGORY UPDATE TESTS
// ============================================

test('users can update category', function () {
    $category = Category::factory()->create(['name' => 'Old Name']);
    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), ['name' => 'New Name'])
        ->assertRedirect(route('categories.index'));

    expect($category->fresh()->name)->toBe('New Name');
    expect($category->fresh()->slug)->toBe('new-name');
});

test('slug is regenerated when name changes', function () {
    $category = Category::factory()->create(['name' => 'Original Name']);
    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), ['name' => 'Updated Name']);

    expect($category->fresh()->slug)->toBe('updated-name');
});

test('category name uniqueness is checked on update', function () {
    $category1 = Category::factory()->create(['name' => 'Category 1']);
    $category2 = Category::factory()->create(['name' => 'Category 2']);

    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category1), ['name' => 'Category 2'])
        ->assertSessionHasErrors('name');
});

test('category can keep its own name on update', function () {
    $category = Category::factory()->create(['name' => 'Test Category']);
    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), [
            'name' => 'Test Category',
            'description' => 'Updated description',
        ])
        ->assertRedirect(route('categories.index'));

    expect($category->fresh()->name)->toBe('Test Category');
});

test('category status can be toggled', function () {
    $category = Category::factory()->create(['is_active' => true]);
    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), [
            'name' => $category->name,
            'is_active' => false,
        ]);

    expect($category->fresh()->is_active)->toBeFalse();
});

test('category cannot be its own parent', function () {
    $category = Category::factory()->create();
    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), [
            'name' => $category->name,
            'parent_id' => $category->id,
        ])
        ->assertSessionHasErrors('parent_id');
});

test('category cannot have its descendant as parent', function () {
    $grandparent = Category::factory()->create(['name' => 'Grandparent']);
    $parent = Category::factory()->withParent($grandparent->id)->create(['name' => 'Parent']);
    $child = Category::factory()->withParent($parent->id)->create(['name' => 'Child']);

    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    // Try to make grandparent a child of its descendant (child)
    $this->actingAs($this->user)
        ->put(route('categories.update', $grandparent), [
            'name' => $grandparent->name,
            'parent_id' => $child->id,
        ])
        ->assertSessionHasErrors('parent_id');
});

test('category can change its parent', function () {
    $parent1 = Category::factory()->create(['name' => 'Parent 1']);
    $parent2 = Category::factory()->create(['name' => 'Parent 2']);
    $child = Category::factory()->withParent($parent1->id)->create();

    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('categories.update', $child), [
            'name' => $child->name,
            'parent_id' => $parent2->id,
        ]);

    expect($child->fresh()->parent_id)->toBe($parent2->id);
});

// ============================================
// CATEGORY DELETION TESTS
// ============================================

test('users can delete category without children', function () {
    $category = Category::factory()->create();
    $deletePermission = Permission::where('name', 'categories.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('cannot delete category with children', function () {
    $parent = Category::factory()->create(['name' => 'Parent']);
    Category::factory()->withParent($parent->id)->create(['name' => 'Child']);

    $deletePermission = Permission::where('name', 'categories.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $parent))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['id' => $parent->id]);
});

// ============================================
// CATEGORY VIEW TESTS
// ============================================

test('users can view category details', function () {
    $category = Category::factory()->create();
    $viewPermission = Permission::where('name', 'categories.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('categories.show', $category))
        ->assertOk();
});

test('category show page loads parent and children relationships', function () {
    $parent = Category::factory()->create(['name' => 'Parent']);
    $category = Category::factory()->withParent($parent->id)->create(['name' => 'Category']);
    $child = Category::factory()->withParent($category->id)->create(['name' => 'Child']);

    $viewPermission = Permission::where('name', 'categories.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('categories.show', $category));

    $response->assertOk();
    $categoryData = $response->viewData('page')['props']['category'];
    expect($categoryData['parent'])->not->toBeNull();
    expect($categoryData['parent']['id'])->toBe($parent->id);
    expect(count($categoryData['children']))->toBe(1);
});

test('category edit excludes itself and descendants from parent options', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->withParent($parent->id)->create();
    $grandchild = Category::factory()->withParent($child->id)->create();

    $editPermission = Permission::where('name', 'categories.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('categories.edit', $parent));

    $response->assertOk();
    $categories = $response->viewData('page')['props']['categories'];
    $categoryIds = collect($categories)->pluck('id')->toArray();

    // Parent should not be in the list
    expect($categoryIds)->not->toContain($parent->id);
    // Child should not be in the list (it's a descendant)
    expect($categoryIds)->not->toContain($child->id);
    // Grandchild should not be in the list (it's a descendant)
    expect($categoryIds)->not->toContain($grandchild->id);
});

// ============================================
// CATEGORY MODEL TESTS
// ============================================

test('category has parent relationship', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->withParent($parent->id)->create();

    expect($child->parent)->not->toBeNull();
    expect($child->parent->id)->toBe($parent->id);
});

test('category has children relationship', function () {
    $parent = Category::factory()->create();
    $child1 = Category::factory()->withParent($parent->id)->create();
    $child2 = Category::factory()->withParent($parent->id)->create();

    expect($parent->children)->toHaveCount(2);
});

test('category can have null parent', function () {
    $category = Category::factory()->create(['parent_id' => null]);

    expect($category->parent)->toBeNull();
});

test('category is_active is cast to boolean', function () {
    $category = Category::factory()->create(['is_active' => 1]);

    expect($category->is_active)->toBeTrue();
    expect($category->is_active)->toBeBool();
});

test('category auto-generates slug when name is set', function () {
    $category = new Category();
    $category->name = 'Test Category Name';
    $category->save();

    expect($category->slug)->toBe('test-category-name');
});

test('category regenerates slug when name changes', function () {
    $category = Category::factory()->create();
    $originalSlug = $category->slug;

    $category->name = 'Updated Name';
    $category->save();

    expect($category->fresh()->slug)->toBe('updated-name');
    expect($category->fresh()->slug)->not->toBe($originalSlug);
});

test('category custom slug is preserved if provided', function () {
    $category = new Category();
    $category->name = 'Test Category';
    $category->slug = 'custom-slug';
    $category->save();

    expect($category->slug)->toBe('custom-slug');
});

// ============================================
// CATEGORY HIERARCHY TESTS
// ============================================

test('can create multi-level category hierarchy', function () {
    $level1 = Category::factory()->create(['name' => 'Level 1']);
    $level2 = Category::factory()->withParent($level1->id)->create(['name' => 'Level 2']);
    $level3 = Category::factory()->withParent($level2->id)->create(['name' => 'Level 3']);

    expect($level3->parent->id)->toBe($level2->id);
    expect($level3->parent->parent->id)->toBe($level1->id);
});

test('deleting parent with grandchildren is prevented', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->withParent($parent->id)->create();
    $grandchild = Category::factory()->withParent($child->id)->create();

    $deletePermission = Permission::where('name', 'categories.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $parent));

    $this->assertDatabaseHas('categories', ['id' => $parent->id]);
});

// ============================================
// CATEGORY PRODUCT RELATIONSHIP TESTS
// ============================================

test('category can have products', function () {
    $category = Category::factory()->create();
    Product::factory()->count(3)->create(['category_id' => $category->id]);

    expect($category->products)->toHaveCount(3);
});

test('category products relationship exists', function () {
    $category = Category::factory()->create();

    expect($category->products())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

// ============================================
// CATEGORY FACTORY TESTS
// ============================================

test('category factory creates valid category', function () {
    $category = Category::factory()->create();

    expect($category->name)->not->toBeEmpty();
    expect($category->is_active)->toBeTrue();
    expect($category->slug)->not->toBeEmpty();
    expect($category->slug)->toBe(\Str::slug($category->name));
    $this->assertDatabaseHas('categories', ['name' => $category->name]);
});

test('category factory can create with parent', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->withParent($parent->id)->create();

    expect($child->parent_id)->toBe($parent->id);
});
