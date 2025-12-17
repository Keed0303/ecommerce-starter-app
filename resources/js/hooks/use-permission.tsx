import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function usePermission() {
    const { auth } = usePage<SharedData>().props;

    const hasPermission = (permission: string): boolean => {
        if (!auth?.permissions) return false;
        return auth.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!auth?.permissions) return false;
        return permissions.some((permission) => auth.permissions.includes(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!auth?.permissions) return false;
        return permissions.every((permission) => auth.permissions.includes(permission));
    };

    return {
        permissions: auth?.permissions || [],
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
