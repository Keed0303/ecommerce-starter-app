<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'is_active',
        'parent_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: Parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Relationship: Children categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Relationship: Products in this category
     */
    public function products(): HasMany
    {
        return $this->hasMany(\App\Models\Product::class, 'category_id');
    }

    /**
     * Boot method to auto-generate slug from name
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($category) {
            // Only auto-generate slug if it's empty OR if name changed and slug wasn't explicitly set
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            } else if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }
}
