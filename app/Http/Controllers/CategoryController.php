<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with('parent', 'children')
            ->latest()
            ->paginate(10);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('categories/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'parent_id' => 'nullable|integer|exists:categories,id',
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? null,
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('parent', 'children');

        return Inertia::render('categories/show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $category->load('parent', 'children');

        // Get all categories except the current one and its descendants
        $categories = Category::where('id', '!=', $category->id)
            ->whereNotIn('id', $this->getDescendantIds($category))
            ->orderBy('name')
            ->get();

        return Inertia::render('categories/edit', [
            'category' => $category,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('A category cannot be its own parent.');
                    }
                    if ($value && in_array($value, $this->getDescendantIds($category))) {
                        $fail('A category cannot have its descendant as a parent.');
                    }
                },
            ],
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $category->slug,
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? $category->is_active,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->with('error', 'Cannot delete category with subcategories. Please delete or reassign subcategories first.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Get all descendant IDs of a category (recursive)
     */
    private function getDescendantIds(Category $category): array
    {
        $ids = [];

        foreach ($category->children as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getDescendantIds($child));
        }

        return $ids;
    }
}
