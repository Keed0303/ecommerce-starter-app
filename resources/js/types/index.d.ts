import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']> | string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions?: Permission[];
    module_order?: ModuleOrder[];
    users_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    module: string;
    action: string;
    display_name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface ModuleOrder {
    id: number;
    role_id: number;
    module: string;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface PermissionGroup {
    [module: string]: Permission[];
}

export interface AvailableModule {
    name: string;
    title: string;
    icon: string;
}
