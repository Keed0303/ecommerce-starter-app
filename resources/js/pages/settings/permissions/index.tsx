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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Key, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Permissions',
        href: '/settings/permissions',
    },
];

interface PaginatedPermissions {
    data: Permission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PermissionsIndexProps {
    permissions: PaginatedPermissions;
}

export default function PermissionsIndex({ permissions }: PermissionsIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

    const handleDeleteClick = (permission: Permission) => {
        setPermissionToDelete(permission);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (permissionToDelete) {
            router.delete(`/settings/permissions/${permissionToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPermissionToDelete(null);
                },
            });
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.data.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage system permissions for role-based access control
                        </p>
                    </div>
                    <Link href="/settings/permissions/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Create Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions</CardTitle>
                        <CardDescription>
                            Showing {permissions.total} permissions grouped by module
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                            <div key={module} className="space-y-2">
                                <h3 className="text-lg font-semibold capitalize border-b pb-2">
                                    {module} Module
                                </h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Permission Name</TableHead>
                                            <TableHead>Display Name</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modulePermissions.map((permission) => (
                                            <TableRow key={permission.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Key className="size-4 text-primary" />
                                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                                            {permission.name}
                                                        </code>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{permission.display_name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                                                        {permission.action}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {permission.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/settings/permissions/${permission.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(permission)}
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}

                        {permissions.data.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No permissions found.
                            </div>
                        )}

                        {permissions.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {permissions.from} to {permissions.to} of {permissions.total} permissions
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/settings/permissions?page=${permissions.current_page - 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={permissions.current_page === 1}
                                        >
                                            Previous
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/settings/permissions?page=${permissions.current_page + 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={permissions.current_page === permissions.last_page}
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
                        <DialogTitle>Delete Permission</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the permission "{permissionToDelete?.display_name}"?
                            This action cannot be undone.
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
