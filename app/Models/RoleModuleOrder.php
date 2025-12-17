<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleModuleOrder extends Model
{
    protected $table = 'role_module_order';

    protected $fillable = [
        'role_id',
        'module',
        'order',
    ];

    /**
     * Get the role that owns the module order.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
