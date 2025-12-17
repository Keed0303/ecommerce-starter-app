import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, Key, LayoutGrid, Package, Settings, Shield, Tag, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermission } from '@/hooks/use-permission';
import { useMemo } from 'react';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
        permission: 'products.view',
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Tag,
        permission: 'categories.view',
    },
    {
        title: 'Settings',
        icon: Settings,
        items: [
            {
                title: 'Users',
                href: '/settings/users',
                icon: Users,
                permission: 'users.view',
            },
            {
                title: 'Roles',
                href: '/settings/roles',
                icon: Shield,
                permission: 'roles.view',
            },
            {
                title: 'Permissions',
                href: '/settings/permissions',
                icon: Key,
                permission: 'permissions.view',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { hasPermission } = usePermission();

    // Filter navigation items based on user permissions
    const filteredNavItems = useMemo(() => {
        const filterItems = (items: NavItem[]): NavItem[] => {
            return items
                .filter((item) => {
                    // If item has a permission requirement, check it
                    if (item.permission && !hasPermission(item.permission)) {
                        return false;
                    }
                    return true;
                })
                .map((item) => {
                    // If item has child items, filter them recursively
                    if (item.items && item.items.length > 0) {
                        const filteredChildren = filterItems(item.items);
                        // Only include parent if it has visible children
                        if (filteredChildren.length === 0) {
                            return null;
                        }
                        return { ...item, items: filteredChildren };
                    }
                    return item;
                })
                .filter((item): item is NavItem => item !== null);
        };

        return filterItems(allNavItems);
    }, [hasPermission]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
