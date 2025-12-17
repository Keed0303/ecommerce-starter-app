import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, Shield, User as UserIcon, Edit } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Users',
        href: '/settings/users',
    },
    {
        title: 'View',
        href: '#',
    },
];

interface ShowUserProps {
    user: User;
}

export default function ShowUser({ user }: ShowUserProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not verified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - User Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/settings/users">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                            <p className="text-muted-foreground">View user information and assigned roles</p>
                        </div>
                    </div>
                    <Link href={`/settings/users/${user.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 size-4" />
                            Edit User
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>User account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-3">
                                <UserIcon className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-base font-semibold">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base font-semibold">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                                    {user.email_verified_at ? (
                                        <div>
                                            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400">
                                                Verified
                                            </Badge>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatDate(user.email_verified_at)}
                                            </p>
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400">
                                            Unverified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                                    <p className="text-sm">{formatDate(user.created_at)}</p>
                                </div>
                            </div>

                            {user.updated_at && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-1 size-5 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                        <p className="text-sm">{formatDate(user.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assigned Roles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="size-5 text-primary" />
                                Assigned Roles
                            </CardTitle>
                            <CardDescription>Roles assigned to this user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.roles && user.roles.length > 0 ? (
                                <div className="space-y-3">
                                    {user.roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{role.name}</h4>
                                                    {role.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {role.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="secondary">Role</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Shield className="size-12 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">No roles assigned</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This user has not been assigned any roles yet.
                                    </p>
                                    <Link href={`/settings/users/${user.id}/edit`} className="mt-4">
                                        <Button variant="outline" size="sm">
                                            <Shield className="mr-2 size-4" />
                                            Assign Roles
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
