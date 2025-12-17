import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number | null;
    category: Category | null;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    created_at: string;
    updated_at: string;
}

interface ShowProductProps {
    product: Product;
}

export default function ShowProduct({ product }: ShowProductProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: '/products',
        },
        {
            title: product.name,
            href: `/products/${product.id}`,
        },
    ];

    const handleDelete = () => {
        router.delete(`/products/${product.id}`, {
            onSuccess: () => {
                router.visit('/products');
            },
        });
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(price));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStockStatus = () => {
        if (product.stock === 0) {
            return (
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                    Out of Stock
                </span>
            );
        } else if (product.stock <= 10) {
            return (
                <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20">
                    Low Stock ({product.stock} units)
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                    In Stock ({product.stock} units)
                </span>
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <p className="text-muted-foreground">Product details and information</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/products/${product.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 size-4 text-destructive" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="size-5" />
                                Product Information
                            </CardTitle>
                            <CardDescription>Basic product details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Product Name</div>
                                <div className="mt-1 text-lg font-semibold">{product.name}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Category</div>
                                <div className="mt-1">
                                    {product.category ? (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                                            {product.category.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">No category assigned</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Description</div>
                                <div className="mt-1 text-sm">
                                    {product.description || (
                                        <span className="text-muted-foreground">No description provided</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                            <CardDescription>Price and stock information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Price</div>
                                <div className="mt-1 text-2xl font-bold text-primary">
                                    {formatPrice(product.price)}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Stock Status</div>
                                <div className="mt-1">{getStockStatus()}</div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="text-sm font-medium text-muted-foreground">Created At</div>
                                <div className="mt-1 text-sm">{formatDate(product.created_at)}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                                <div className="mt-1 text-sm">{formatDate(product.updated_at)}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {product.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
