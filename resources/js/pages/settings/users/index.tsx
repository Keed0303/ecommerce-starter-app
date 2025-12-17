import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Columns3, Edit, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index, create } from '@/routes/users';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Users',
        href: '/settings/users',
    },
];

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface UsersIndexProps {
    users: PaginatedUsers;
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Column visibility state
    const [columnVisibility, setColumnVisibility] = useState({
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        actions: true,
    });

    const toggleColumn = (column: keyof typeof columnVisibility) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (userToDelete) {
            router.delete(`/settings/users/${userToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedRole('all');
        setShowVerifiedOnly(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not verified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground">
                            Manage user accounts and permissions
                        </p>
                    </div>
                    <Link href={create.url()}>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add User
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            A list of all users including their name, email and verification status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {/* Search Input */}
                                <div className="relative flex-1 sm:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {/* Column Filter Button */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                <Columns3 className="mr-2 size-4" />
                                                Columns
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px]">
                                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.name}
                                                onCheckedChange={() => toggleColumn('name')}
                                            >
                                                Name
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.email}
                                                onCheckedChange={() => toggleColumn('email')}
                                            >
                                                Email
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.emailVerified}
                                                onCheckedChange={() => toggleColumn('emailVerified')}
                                            >
                                                Email Verified
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.createdAt}
                                                onCheckedChange={() => toggleColumn('createdAt')}
                                            >
                                                Created At
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.actions}
                                                onCheckedChange={() => toggleColumn('actions')}
                                            >
                                                Actions
                                            </DropdownMenuCheckboxItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Filter Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => setFiltersOpen(!filtersOpen)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Filter className="mr-2 size-4" />
                                        Filters
                                        {(selectedRole !== 'all' || showVerifiedOnly) && (
                                            <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {(selectedRole !== 'all' ? 1 : 0) + (showVerifiedOnly ? 1 : 0)}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {filtersOpen && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">Filters</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                        >
                                            <X className="mr-2 size-4" />
                                            Clear All
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {/* Role Filter */}
                                        <div className="space-y-2">
                                            <Label htmlFor="role-filter">Role</Label>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger id="role-filter">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Roles</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="moderator">Moderator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Verification Status Filter */}
                                        <div className="space-y-2">
                                            <Label>Verification Status</Label>
                                            <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                                                <Checkbox
                                                    id="verified-only"
                                                    checked={showVerifiedOnly}
                                                    onCheckedChange={(checked) =>
                                                        setShowVerifiedOnly(checked === true)
                                                    }
                                                />
                                                <Label
                                                    htmlFor="verified-only"
                                                    className="cursor-pointer text-sm font-normal"
                                                >
                                                    Show verified users only
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters Display */}
                            {(searchQuery || selectedRole !== 'all' || showVerifiedOnly) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Active filters:</span>
                                    {searchQuery && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Search: {searchQuery}</span>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                    {selectedRole !== 'all' && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Role: {selectedRole}</span>
                                            <button
                                                onClick={() => setSelectedRole('all')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                    {showVerifiedOnly && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Verified only</span>
                                            <button
                                                onClick={() => setShowVerifiedOnly(false)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columnVisibility.name && <TableHead>Name</TableHead>}
                                    {columnVisibility.email && <TableHead>Email</TableHead>}
                                    {columnVisibility.emailVerified && <TableHead>Email Verified</TableHead>}
                                    {columnVisibility.createdAt && <TableHead>Created At</TableHead>}
                                    {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={Object.values(columnVisibility).filter(Boolean).length}
                                            className="text-center text-muted-foreground"
                                        >
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            {columnVisibility.name && (
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={`/settings/users/${user.id}`}
                                                        className="hover:underline hover:text-primary transition-colors"
                                                    >
                                                        {user.name}
                                                    </Link>
                                                </TableCell>
                                            )}
                                            {columnVisibility.email && (
                                                <TableCell>{user.email}</TableCell>
                                            )}
                                            {columnVisibility.emailVerified && (
                                                <TableCell>
                                                    {user.email_verified_at ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20">
                                                            Unverified
                                                        </span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {columnVisibility.createdAt && (
                                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                            )}
                                            {columnVisibility.actions && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/settings/users/${user.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/settings/users/${user.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(user)}
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {users.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users.from} to {users.to} of {users.total} users
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/settings/users?page=${users.current_page - 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={users.current_page === 1}
                                        >
                                            Previous
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/settings/users?page=${users.current_page + 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={users.current_page === users.last_page}
                                        >
                                            Next
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {userToDelete?.name}? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
