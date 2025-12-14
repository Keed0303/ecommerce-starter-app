import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Permissions',
        href: '/settings/permissions',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

const availableModules = [
    'dashboard',
    'users',
    'roles',
    'permissions',
    'settings',
];

const availableActions = [
    'view',
    'create',
    'edit',
    'delete',
];

interface EditPermissionProps {
    permission: Permission;
}

export default function EditPermission({ permission }: EditPermissionProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name || '',
        module: permission.module || '',
        action: permission.action || '',
        display_name: permission.display_name || '',
        description: permission.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/settings/permissions/${permission.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${permission.display_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Link href="/settings/permissions">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
                        <p className="text-muted-foreground">Update permission information</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Permission Details</CardTitle>
                        <CardDescription>
                            Update the permission information below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Module and Action Selection */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="module">Module</Label>
                                    <Select value={data.module} onValueChange={(value) => setData('module', value)}>
                                        <SelectTrigger id="module">
                                            <SelectValue placeholder="Select module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableModules.map((module) => (
                                                <SelectItem key={module} value={module}>
                                                    <span className="capitalize">{module}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.module} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="action">Action</Label>
                                    <Select value={data.action} onValueChange={(value) => setData('action', value)}>
                                        <SelectTrigger id="action">
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableActions.map((action) => (
                                                <SelectItem key={action} value={action}>
                                                    <span className="capitalize">{action}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.action} />
                                </div>
                            </div>

                            {/* Permission Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., users.view"
                                    className="font-mono"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="display_name">Display Name</Label>
                                <Input
                                    id="display_name"
                                    type="text"
                                    value={data.display_name}
                                    onChange={(e) => setData('display_name', e.target.value)}
                                    placeholder="e.g., View Users"
                                />
                                <InputError message={errors.display_name} />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what this permission allows"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Permission'}
                                </Button>
                                <Link href="/settings/permissions">
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
