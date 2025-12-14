import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { RolePermissionSelector } from '@/components/role-permission-selector';
import { ModuleOrderDragDrop } from '@/components/module-order-dragdrop';
import { type AvailableModule, type BreadcrumbItem, type ModuleOrder, type PermissionGroup } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Roles',
        href: '/settings/roles',
    },
    {
        title: 'Create',
        href: '#',
    },
];

interface CreateRoleProps {
    permissions: PermissionGroup;
    modules: AvailableModule[];
}

export default function CreateRole({ permissions, modules }: CreateRoleProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        permissions: [] as number[],
        moduleOrder: [] as ModuleOrder[],
    });

    const [moduleOrder, setModuleOrder] = useState<ModuleOrder[]>([]);

    // Initialize module order when modules are loaded
    useEffect(() => {
        if (modules.length > 0 && moduleOrder.length === 0) {
            const initialOrder: ModuleOrder[] = modules.map((module, index) => ({
                id: 0,
                role_id: 0,
                module: module.name,
                order: index + 1,
                created_at: '',
                updated_at: '',
            }));
            setModuleOrder(initialOrder);
            setData('moduleOrder', initialOrder);
        }
    }, [modules]);

    const handleModuleOrderChange = (newOrder: ModuleOrder[]) => {
        setModuleOrder(newOrder);
        setData('moduleOrder', newOrder);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/roles');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Link href="/settings/roles">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
                        <p className="text-muted-foreground">Define role details, permissions and module order</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Enter the role name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Admin, Manager, User"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of the role"
                                        rows={1}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Split Layout: Permissions and Module Order */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column: Permissions */}
                        <div className="space-y-4">
                            <RolePermissionSelector
                                permissions={permissions}
                                selectedPermissions={data.permissions}
                                onChange={(selected) => setData('permissions', selected)}
                            />
                            {errors.permissions && (
                                <p className="text-sm text-destructive">{errors.permissions}</p>
                            )}
                        </div>

                        {/* Right Column: Module Order */}
                        <div className="space-y-4">
                            <ModuleOrderDragDrop
                                modules={modules}
                                moduleOrder={moduleOrder}
                                onChange={handleModuleOrderChange}
                            />
                            {errors.moduleOrder && (
                                <p className="text-sm text-destructive">{errors.moduleOrder}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Role'}
                        </Button>
                        <Link href="/settings/roles">
                            <Button type="button" variant="outline" disabled={processing}>
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
