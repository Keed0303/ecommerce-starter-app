# User Management System Prompt

## Context
This is a Laravel 11 + React 19 + TypeScript e-commerce application. We need to add a User Management system with:
1. A "Settings" parent menu item in the sidebar
2. A "Users" child menu item under Settings
3. A complete CRUD (Create, Read, Update, Delete) interface for managing users
4. A users table with sortable columns and pagination

---

## Requirements

### Sidebar Structure
```
Dashboard
Settings (Parent - Collapsible)
  └── Users (Child - navigates to /settings/users)
```

### User Management Features
1. **List Users** - Table view with pagination
2. **Create User** - Form to add new users
3. **Edit User** - Form to update existing users
4. **Delete User** - Confirm and delete users
5. **View User** - Display user details (optional)

### User Table Columns
- Name
- Email
- Email Verified At
- Created At
- Actions (Edit, Delete)

---

## Implementation Plan

### Backend (Laravel)
1. **Controller**: `UserController` with CRUD methods
2. **Routes**: RESTful routes for user management
3. **Validation**: Request validation for create/update
4. **Authorization**: Ensure only admins can manage users

### Frontend (React)
1. **Page**: `users/index.tsx` - List users with table
2. **Component**: `users/create.tsx` - Create user form
3. **Component**: `users/edit.tsx` - Edit user form
4. **Component**: Delete confirmation modal
5. **Sidebar**: Update with Settings parent and Users child

### File Structure
```
app/Http/Controllers/Settings/
└── UserController.php

resources/js/pages/settings/
├── users/
│   ├── index.tsx
│   ├── create.tsx
│   └── edit.tsx

routes/
└── settings.php (update with user routes)

resources/js/components/
└── app-sidebar.tsx (update with Settings section)
```

---

## Technical Specifications

### Routes
```php
Route::prefix('settings')->group(function () {
    Route::resource('users', UserController::class);
});
```

### API Endpoints
- GET `/settings/users` - List all users (with pagination)
- GET `/settings/users/create` - Show create form
- POST `/settings/users` - Store new user
- GET `/settings/users/{id}/edit` - Show edit form
- PUT/PATCH `/settings/users/{id}` - Update user
- DELETE `/settings/users/{id}` - Delete user

### Data Structure
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface UsersPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
```

---

## Key Features

### 1. Paginated User Table
- Sortable columns
- Search functionality
- Items per page selector
- Pagination controls

### 2. User Forms
- Name field (required)
- Email field (required, unique)
- Password field (required for create, optional for edit)
- Email verification option
- Form validation with error messages

### 3. Delete Confirmation
- Modal dialog before deletion
- Prevent accidental deletions
- Success/error notifications

### 4. Sidebar Integration
- Collapsible Settings parent
- Active state highlighting
- Smooth transitions

---

## Security Considerations

1. **Authorization**: Only authenticated users with proper permissions can manage users
2. **Validation**: Server-side validation for all inputs
3. **Password Hashing**: All passwords must be hashed using bcrypt
4. **CSRF Protection**: Laravel/Inertia handles automatically
5. **Self-Protection**: Users cannot delete themselves

---

## UI/UX Requirements

### Table View
- Clean, modern design using Radix UI components
- Responsive layout (mobile-friendly)
- Loading states
- Empty state when no users

### Forms
- Clear labels and placeholders
- Inline validation errors
- Submit/Cancel buttons
- Loading state on submit

### Notifications
- Success message after create/update/delete
- Error messages for failures
- Toast notifications or alerts

---

## Code Patterns to Follow

### Backend Pattern (UserController)
```php
public function index()
{
    $users = User::latest()->paginate(10);

    return Inertia::render('settings/users/index', [
        'users' => $users
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:8',
    ]);

    User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => bcrypt($validated['password']),
    ]);

    return redirect()->route('users.index')
        ->with('success', 'User created successfully');
}
```

### Frontend Pattern (Users Index)
```typescript
export default function UsersIndex({ users }: UsersPageProps) {
    return (
        <AppLayout>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex justify-between mb-4">
                    <h1>Users</h1>
                    <Link href={route('users.create')}>
                        <Button>Add User</Button>
                    </Link>
                </div>

                <Table>
                    {/* Table implementation */}
                </Table>

                <Pagination data={users} />
            </div>
        </AppLayout>
    );
}
```

---

## Testing Checklist

- [ ] Users table displays all users
- [ ] Pagination works correctly
- [ ] Create user form validates inputs
- [ ] New users are saved to database
- [ ] Edit user form pre-fills with existing data
- [ ] User updates save correctly
- [ ] Delete confirmation appears
- [ ] Users are deleted from database
- [ ] Sidebar Settings menu is collapsible
- [ ] Users menu item is highlighted when active
- [ ] All routes are protected by auth middleware
- [ ] Form errors display correctly
- [ ] Success messages appear after actions

---

## Enhancements (Optional)

1. **Search**: Filter users by name or email
2. **Sorting**: Click column headers to sort
3. **Bulk Actions**: Select multiple users for bulk delete
4. **User Roles**: Add role management
5. **User Status**: Active/Inactive toggle
6. **Export**: Export users to CSV
7. **Filters**: Filter by verified/unverified

---

## Dependencies

### Required Packages (Already Installed)
- Inertia.js
- React
- TypeScript
- Radix UI components
- Lucide React (icons)

### Components to Create
- User table component
- User form component
- Delete confirmation dialog
- Pagination component (or use existing)

---

## Common Issues & Solutions

### Issue: Users can delete themselves
**Solution**: Add check in destroy method
```php
if ($user->id === auth()->id()) {
    return back()->with('error', 'Cannot delete yourself');
}
```

### Issue: Password required when editing
**Solution**: Make password optional on update
```php
'password' => 'nullable|min:8',
```

### Issue: Pagination links not styled
**Solution**: Use custom pagination component with Tailwind

---

## Success Criteria

The implementation is complete when:
1. ✅ Settings parent menu appears in sidebar
2. ✅ Users child menu navigates to /settings/users
3. ✅ Users table displays with pagination
4. ✅ Can create new users via form
5. ✅ Can edit existing users
6. ✅ Can delete users (with confirmation)
7. ✅ All routes are protected
8. ✅ Forms have validation
9. ✅ Success/error messages display
10. ✅ UI is responsive and polished

---

## Example AI Prompt

When asking AI for help with this feature:

"I'm implementing user management in a Laravel + React e-commerce app. The sidebar should have a 'Settings' parent menu with a 'Users' child item. The users page needs a table with CRUD operations. I'm using Inertia.js, React 19, TypeScript, and Radix UI components. The backend is Laravel 11."

Reference this system prompt for complete context.

---

**Created**: December 9, 2025
**Purpose**: User Management Feature Implementation Guide
**Status**: Ready for Implementation
