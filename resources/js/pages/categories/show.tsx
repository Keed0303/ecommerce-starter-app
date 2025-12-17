import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Folder, ImageIcon, Link as LinkIcon, Tag } from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';

interface ShowCategoryProps {
    category: Category;
}

export default function ShowCategory({ category }: ShowCategoryProps) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: category.name,
            href: `/categories/${category.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
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
            <Head title={`${category.name} - Category Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/categories">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Category Details</h1>
                            <p className="text-muted-foreground">View category information</p>
                        </div>
                    </div>
                    {hasPermission('categories.edit') && (
                        <Link href={`/categories/${category.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 size-4" />
                                Edit Category
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Category details and settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {category.image && (
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="mt-1 size-5 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Image</p>
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-32 w-32 rounded-lg border object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Tag className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-base font-semibold">{category.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <LinkIcon className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                    <p className="font-mono text-sm">{category.slug}</p>
                                </div>
                            </div>

                            {category.description && (
                                <div className="flex items-start gap-3">
                                    <Folder className="mt-1 size-5 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                                        <p className="text-sm">{category.description}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Tag className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    {category.is_active ? (
                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm">{formatDate(category.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-1 size-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-sm">{formatDate(category.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Relationships */}
                    <div className="space-y-6">
                        {/* Parent Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Folder className="size-5 text-primary" />
                                    Parent Category
                                </CardTitle>
                                <CardDescription>The parent category of this category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {category.parent ? (
                                    <Link
                                        href={`/categories/${category.parent.id}`}
                                        className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold">{category.parent.name}</h4>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {category.parent.slug}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">Parent</Badge>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Folder className="size-12 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">No parent category</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This is a top-level category.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Child Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Folder className="size-5 text-primary" />
                                    Subcategories
                                </CardTitle>
                                <CardDescription>
                                    Categories that belong to this category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {category.children && category.children.length > 0 ? (
                                    <div className="space-y-3">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/categories/${child.id}`}
                                                className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h4 className="font-semibold">{child.name}</h4>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {child.slug}
                                                        </p>
                                                    </div>
                                                    {child.is_active ? (
                                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Folder className="size-12 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">No subcategories</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This category doesn't have any subcategories yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
