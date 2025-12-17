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

test('guests are redirected to login when accessing products', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('users without permission cannot access products index', function () {
    $this->actingAs($this->user)
        ->get(route('products.index'))
        ->assertStatus(403);
});

test('users with permission can access products index', function () {
    $permission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('products.index'))
        ->assertOk();
});

// ============================================
// PRODUCT LISTING TESTS
// ============================================

test('products index shows paginated list', function () {
    $permission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    Product::factory()->count(15)->create();

    $response = $this->actingAs($this->user)->get(route('products.index'));

    $response->assertOk();
    $products = $response->viewData('page')['props']['products'];
    expect($products['per_page'])->toBe(10);
});

test('products index loads category relationship', function () {
    $permission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($this->user)->get(route('products.index'));

    $response->assertOk();
    $products = $response->viewData('page')['props']['products'];
    $firstProduct = $products['data'][0];
    expect($firstProduct['category'])->not->toBeNull();
    expect($firstProduct['category']['id'])->toBe($category->id);
});

test('products index provides categories for filtering', function () {
    $permission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($permission->id);
    $this->user->roles()->attach($this->role->id);

    Category::factory()->count(5)->create();

    $response = $this->actingAs($this->user)->get(route('products.index'));

    $response->assertOk();
    $categories = $response->viewData('page')['props']['categories'];
    expect(count($categories))->toBe(5);
});

// ============================================
// PRODUCT CREATION TESTS
// ============================================

test('users can create a product with category', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $category = Category::factory()->create();

    $data = [
        'category_id' => $category->id,
        'name' => 'Test Product',
        'description' => 'Test description',
        'price' => 99.99,
        'stock' => 10,
    ];

    $this->actingAs($this->user)
        ->post(route('products.store'), $data)
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'category_id' => $category->id,
        'name' => 'Test Product',
        'price' => 99.99,
        'stock' => 10,
    ]);
});

test('users can create a product without category', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $data = [
        'name' => 'Test Product',
        'description' => 'Test description',
        'price' => 99.99,
        'stock' => 10,
    ];

    $this->actingAs($this->user)
        ->post(route('products.store'), $data)
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'category_id' => null,
        'name' => 'Test Product',
    ]);
});

test('product name is required', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'price' => 99.99,
            'stock' => 10,
        ])
        ->assertSessionHasErrors('name');
});

test('product price must be numeric', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'name' => 'Test Product',
            'price' => 'not-a-number',
            'stock' => 10,
        ])
        ->assertSessionHasErrors('price');
});

test('product price cannot be negative', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'name' => 'Test Product',
            'price' => -10,
            'stock' => 10,
        ])
        ->assertSessionHasErrors('price');
});

test('product stock must be an integer', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => 'not-a-number',
        ])
        ->assertSessionHasErrors('stock');
});

test('product stock cannot be negative', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => -5,
        ])
        ->assertSessionHasErrors('stock');
});

test('product description is optional', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => 10,
        ])
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Test Product',
        'description' => null,
    ]);
});

test('product category must exist', function () {
    $createPermission = Permission::where('name', 'products.create')->first();
    $this->role->permissions()->attach($createPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'category_id' => 99999,
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => 10,
        ])
        ->assertSessionHasErrors('category_id');
});

// ============================================
// PRODUCT UPDATE TESTS
// ============================================

test('users can update a product', function () {
    $product = Product::factory()->create();
    $editPermission = Permission::where('name', 'products.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('products.update', $product), [
            'name' => 'Updated Product',
            'description' => 'Updated description',
            'price' => 149.99,
            'stock' => 20,
        ])
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->name)->toBe('Updated Product');
    expect($product->fresh()->price)->toBe('149.99');
    expect($product->fresh()->stock)->toBe(20);
});

test('users can change product category', function () {
    $category1 = Category::factory()->create();
    $category2 = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category1->id]);

    $editPermission = Permission::where('name', 'products.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('products.update', $product), [
            'category_id' => $category2->id,
            'name' => $product->name,
            'price' => $product->price,
            'stock' => $product->stock,
        ])
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->category_id)->toBe($category2->id);
});

test('users can remove product category', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $editPermission = Permission::where('name', 'products.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('products.update', $product), [
            'category_id' => null,
            'name' => $product->name,
            'price' => $product->price,
            'stock' => $product->stock,
        ])
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->category_id)->toBeNull();
});

test('product update validates required fields', function () {
    $product = Product::factory()->create();
    $editPermission = Permission::where('name', 'products.edit')->first();
    $this->role->permissions()->attach($editPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->put(route('products.update', $product), [])
        ->assertSessionHasErrors(['name', 'price', 'stock']);
});

// ============================================
// PRODUCT DELETION TESTS
// ============================================

test('users can delete a product', function () {
    $product = Product::factory()->create();
    $deletePermission = Permission::where('name', 'products.delete')->first();
    $this->role->permissions()->attach($deletePermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->delete(route('products.destroy', $product))
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

// ============================================
// PRODUCT VIEW TESTS
// ============================================

test('users can view product details', function () {
    $product = Product::factory()->create();
    $viewPermission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $this->actingAs($this->user)
        ->get(route('products.show', $product))
        ->assertOk();
});

test('product show page loads category relationship', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $viewPermission = Permission::where('name', 'products.view')->first();
    $this->role->permissions()->attach($viewPermission->id);
    $this->user->roles()->attach($this->role->id);

    $response = $this->actingAs($this->user)
        ->get(route('products.show', $product));

    $response->assertOk();
    $productData = $response->viewData('page')['props']['product'];
    expect($productData['category'])->not->toBeNull();
    expect($productData['category']['id'])->toBe($category->id);
});

// ============================================
// PRODUCT MODEL TESTS
// ============================================

test('product belongs to category', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    expect($product->category)->not->toBeNull();
    expect($product->category->id)->toBe($category->id);
});

test('product can have null category', function () {
    $product = Product::factory()->create(['category_id' => null]);

    expect($product->category)->toBeNull();
});

test('product price is cast to decimal', function () {
    $product = Product::factory()->create(['price' => 99.99]);

    expect($product->price)->toBe('99.99');
});

test('product stock is cast to integer', function () {
    $product = Product::factory()->create(['stock' => '50']);

    expect($product->stock)->toBe(50);
});

test('product has sales relationship', function () {
    $product = Product::factory()->create();

    expect($product->sales())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

// ============================================
// CATEGORY RELATIONSHIP TESTS
// ============================================

test('product category is set to null when category is deleted', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $category->delete();

    expect($product->fresh()->category_id)->toBeNull();
});

test('multiple products can share the same category', function () {
    $category = Category::factory()->create();
    $product1 = Product::factory()->create(['category_id' => $category->id]);
    $product2 = Product::factory()->create(['category_id' => $category->id]);

    expect($product1->category_id)->toBe($category->id);
    expect($product2->category_id)->toBe($category->id);
});

// ============================================
// PRODUCT FACTORY TESTS
// ============================================

test('product factory creates valid product', function () {
    $product = Product::factory()->create([
        'name' => 'Factory Product',
        'price' => 49.99,
        'stock' => 100,
    ]);

    expect($product->name)->toBe('Factory Product');
    expect($product->price)->toBe('49.99');
    expect($product->stock)->toBe(100);
    $this->assertDatabaseHas('products', ['name' => 'Factory Product']);
});
