<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RoleModuleOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::withCount('users')
            ->latest()
            ->paginate(10);

        return Inertia::render('settings/roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::orderBy('module')
            ->orderBy('action')
            ->get()
            ->groupBy('module');

        $modules = $this->getAvailableModules();

        return Inertia::render('settings/roles/create', [
            'permissions' => $permissions,
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
            'moduleOrder' => 'required|array',
            'moduleOrder.*.module' => 'required|string',
            'moduleOrder.*.order' => 'required|integer|min:1',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        // Attach permissions
        $role->permissions()->sync($validated['permissions']);

        // Save module order
        foreach ($validated['moduleOrder'] as $moduleData) {
            RoleModuleOrder::create([
                'role_id' => $role->id,
                'module' => $moduleData['module'],
                'order' => $moduleData['order'],
            ]);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load(['permissions', 'moduleOrder']);

        $permissions = Permission::orderBy('module')
            ->orderBy('action')
            ->get()
            ->groupBy('module');

        $modules = $this->getAvailableModules();

        return Inertia::render('settings/roles/edit', [
            'role' => $role,
            'permissions' => $permissions,
            'modules' => $modules,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
            'moduleOrder' => 'required|array',
            'moduleOrder.*.module' => 'required|string',
            'moduleOrder.*.order' => 'required|integer|min:1',
        ]);

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        // Sync permissions
        $role->permissions()->sync($validated['permissions']);

        // Delete existing module order
        $role->moduleOrder()->delete();

        // Save new module order
        foreach ($validated['moduleOrder'] as $moduleData) {
            RoleModuleOrder::create([
                'role_id' => $role->id,
                'module' => $moduleData['module'],
                'order' => $moduleData['order'],
            ]);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Prevent deletion if role has users
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role that is assigned to users.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Get available modules from sidebar configuration.
     */
    private function getAvailableModules(): array
    {
        return [
            [
                'name' => 'dashboard',
                'title' => 'Dashboard',
                'icon' => 'LayoutGrid',
            ],
            [
                'name' => 'users',
                'title' => 'Users',
                'icon' => 'Users',
            ],
            [
                'name' => 'settings',
                'title' => 'Settings',
                'icon' => 'Settings',
            ],
        ];
    }
}
