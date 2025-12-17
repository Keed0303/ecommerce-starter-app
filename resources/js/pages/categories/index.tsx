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
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { create } from '@/routes/categories';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

interface PaginatedCategories {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface CategoriesIndexProps {
    categories: PaginatedCategories;
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const { hasPermission } = usePermission();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            router.delete(`/categories/${categoryToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setCategoryToDelete(null);
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredCategories = categories.data.filter((category) => {
        const matchesSearch =
            searchQuery === '' ||
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage product categories and subcategories
                        </p>
                    </div>
                    {hasPermission('categories.create') && (
                        <Link href={create.url()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Category
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                        <CardDescription>
                            A list of all categories including their name, slug, parent, and status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Section */}
                        <div className="flex flex-col gap-4">
                            <div className="relative flex-1 sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground"
                                        >
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>
                                                {category.image ? (
                                                    <img
                                                        src={category.image}
                                                        alt={category.name}
                                                        className="size-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-10 items-center justify-center rounded bg-muted">
                                                        <ImageIcon className="size-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/categories/${category.id}`}
                                                    className="hover:underline hover:text-primary transition-colors"
                                                >
                                                    {category.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {category.slug}
                                            </TableCell>
                                            <TableCell>
                                                {category.parent ? (
                                                    <Link
                                                        href={`/categories/${category.parent.id}`}
                                                        className="text-sm hover:underline hover:text-primary transition-colors"
                                                    >
                                                        {category.parent.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {category.is_active ? (
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(category.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('categories.view') && (
                                                        <Link href={`/categories/${category.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {hasPermission('categories.edit') && (
                                                        <Link href={`/categories/${category.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {hasPermission('categories.delete') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(category)}
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {categories.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {categories.from} to {categories.to} of {categories.total} categories
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/categories?page=${categories.current_page - 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={categories.current_page === 1}
                                        >
                                            Previous
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/categories?page=${categories.current_page + 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={categories.current_page === categories.last_page}
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
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {categoryToDelete?.name}? This action cannot be
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
