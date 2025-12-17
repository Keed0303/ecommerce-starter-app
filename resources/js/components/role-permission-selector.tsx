import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { type Permission, type PermissionGroup } from '@/types';
import { Check, Minus } from 'lucide-react';
import { useMemo } from 'react';

interface RolePermissionSelectorProps {
    permissions: PermissionGroup;
    selectedPermissions: number[];
    onChange: (selectedIds: number[]) => void;
}

export function RolePermissionSelector({
    permissions,
    selectedPermissions,
    onChange,
}: RolePermissionSelectorProps) {
    const togglePermission = (permissionId: number) => {
        if (selectedPermissions.includes(permissionId)) {
            onChange(selectedPermissions.filter((id) => id !== permissionId));
        } else {
            onChange([...selectedPermissions, permissionId]);
        }
    };

    const toggleModulePermissions = (modulePermissions: Permission[]) => {
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            onChange(selectedPermissions.filter((id) => !modulePermissionIds.includes(id)));
        } else {
            const newSelected = [...selectedPermissions];
            modulePermissionIds.forEach((id) => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
            onChange(newSelected);
        }
    };

    const getModuleCheckState = (modulePermissions: Permission[]) => {
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        const selectedCount = modulePermissionIds.filter((id) => selectedPermissions.includes(id)).length;

        if (selectedCount === 0) return 'unchecked';
        if (selectedCount === modulePermissionIds.length) return 'checked';
        return 'indeterminate';
    };

    const totalPermissions = useMemo(() => {
        return Object.values(permissions).flat().length;
    }, [permissions]);

    const totalSelected = selectedPermissions.length;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                    Select which permissions this role should have ({totalSelected}/{totalPermissions} selected)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(permissions).map(([module, modulePermissions]) => {
                    const checkState = getModuleCheckState(modulePermissions);

                    return (
                        <div key={module} className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border-b pb-2">
                                <Label className="text-base font-semibold capitalize">
                                    {module}
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleModulePermissions(modulePermissions)}
                                    className="h-auto px-2 py-1"
                                >
                                    {checkState === 'checked' ? (
                                        <span className="flex items-center gap-1 text-xs">
                                            <Check className="size-3" />
                                            Deselect All
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs">
                                            {checkState === 'indeterminate' && <Minus className="size-3" />}
                                            Select All
                                        </span>
                                    )}
                                </Button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {modulePermissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="flex items-start space-x-3 rounded-md border p-3 hover:bg-accent/50"
                                    >
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={selectedPermissions.includes(permission.id)}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <Label
                                                htmlFor={`permission-${permission.id}`}
                                                className="cursor-pointer text-sm font-medium leading-none"
                                            >
                                                {permission.display_name}
                                            </Label>
                                            {permission.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {permission.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
