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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Columns3, Edit, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { create } from '@/routes/products';
import { usePermission } from '@/hooks/use-permission';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    category_id: number | null;
    category: Category | null;
    created_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface ProductsIndexProps {
    products: PaginatedProducts;
    categories: Category[];
}

export default function ProductsIndex({ products, categories }: ProductsIndexProps) {
    const { hasPermission } = usePermission();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Column visibility state
    const [columnVisibility, setColumnVisibility] = useState({
        name: true,
        category: true,
        description: true,
        price: true,
        stock: true,
        createdAt: true,
        actions: true,
    });

    const toggleColumn = (column: keyof typeof columnVisibility) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (productToDelete) {
            router.delete(`/products/${productToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setPriceFilter('all');
        setStockFilter('all');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(price));
    };

    // Filter products based on search and filters
    const filteredProducts = products.data.filter((product) => {
        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
            if (product.category_id?.toString() !== selectedCategory) return false;
        }

        // Price filter
        if (priceFilter !== 'all') {
            const price = parseFloat(product.price);
            if (priceFilter === 'low-price' && price > 50) return false;
            if (priceFilter === 'medium-price' && (price <= 50 || price > 200)) return false;
            if (priceFilter === 'high-price' && price <= 200) return false;
        }

        // Stock filter
        if (stockFilter !== 'all') {
            if (stockFilter === 'in-stock' && product.stock <= 10) return false;
            if (stockFilter === 'low-stock' && (product.stock === 0 || product.stock > 10)) return false;
            if (stockFilter === 'out-of-stock' && product.stock > 0) return false;
        }

        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">
                            Manage your product inventory
                        </p>
                    </div>
                    {hasPermission('products.create') && (
                        <Link href={create.url()}>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Product
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                        <CardDescription>
                            A list of all products including their name, price, and stock levels.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {/* Search Input */}
                                <div className="relative flex-1 sm:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {/* Column Filter Button */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                <Columns3 className="mr-2 size-4" />
                                                Columns
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px]">
                                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.name}
                                                onCheckedChange={() => toggleColumn('name')}
                                            >
                                                Name
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.category}
                                                onCheckedChange={() => toggleColumn('category')}
                                            >
                                                Category
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.description}
                                                onCheckedChange={() => toggleColumn('description')}
                                            >
                                                Description
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.price}
                                                onCheckedChange={() => toggleColumn('price')}
                                            >
                                                Price
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.stock}
                                                onCheckedChange={() => toggleColumn('stock')}
                                            >
                                                Stock
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.createdAt}
                                                onCheckedChange={() => toggleColumn('createdAt')}
                                            >
                                                Created At
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={columnVisibility.actions}
                                                onCheckedChange={() => toggleColumn('actions')}
                                            >
                                                Actions
                                            </DropdownMenuCheckboxItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Filter Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => setFiltersOpen(!filtersOpen)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Filter className="mr-2 size-4" />
                                        Filters
                                        {(selectedCategory !== 'all' || priceFilter !== 'all' || stockFilter !== 'all') && (
                                            <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {(selectedCategory !== 'all' ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0) + (stockFilter !== 'all' ? 1 : 0)}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {filtersOpen && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">Filters</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                        >
                                            <X className="mr-2 size-4" />
                                            Clear All
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        {/* Category Filter */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category-filter">Category</Label>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger id="category-filter">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Price Filter */}
                                        <div className="space-y-2">
                                            <Label htmlFor="price-filter">Price</Label>
                                            <Select value={priceFilter} onValueChange={setPriceFilter}>
                                                <SelectTrigger id="price-filter">
                                                    <SelectValue placeholder="Select price" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Prices</SelectItem>
                                                    <SelectItem value="low-price">Low Price (≤$50)</SelectItem>
                                                    <SelectItem value="medium-price">Medium Price ($50-$200)</SelectItem>
                                                    <SelectItem value="high-price">High Price (>$200)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Stock Filter */}
                                        <div className="space-y-2">
                                            <Label htmlFor="stock-filter">Stock Status</Label>
                                            <Select value={stockFilter} onValueChange={setStockFilter}>
                                                <SelectTrigger id="stock-filter">
                                                    <SelectValue placeholder="Select stock status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Stock</SelectItem>
                                                    <SelectItem value="in-stock">In Stock (>10)</SelectItem>
                                                    <SelectItem value="low-stock">Low Stock (1-10)</SelectItem>
                                                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters Display */}
                            {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all' || stockFilter !== 'all') && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Active filters:</span>
                                    {searchQuery && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Search: {searchQuery}</span>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                    {selectedCategory !== 'all' && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>
                                                Category: {categories.find((c) => c.id.toString() === selectedCategory)?.name}
                                            </span>
                                            <button
                                                onClick={() => setSelectedCategory('all')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                    {priceFilter !== 'all' && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Price: {priceFilter.replace('-', ' ')}</span>
                                            <button
                                                onClick={() => setPriceFilter('all')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                    {stockFilter !== 'all' && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                                            <span>Stock: {stockFilter.replace('-', ' ')}</span>
                                            <button
                                                onClick={() => setStockFilter('all')}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columnVisibility.name && <TableHead>Name</TableHead>}
                                    {columnVisibility.category && <TableHead>Category</TableHead>}
                                    {columnVisibility.description && <TableHead>Description</TableHead>}
                                    {columnVisibility.price && <TableHead>Price</TableHead>}
                                    {columnVisibility.stock && <TableHead>Stock</TableHead>}
                                    {columnVisibility.createdAt && <TableHead>Created At</TableHead>}
                                    {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={Object.values(columnVisibility).filter(Boolean).length}
                                            className="text-center text-muted-foreground"
                                        >
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            {columnVisibility.name && (
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="hover:underline hover:text-primary transition-colors"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                </TableCell>
                                            )}
                                            {columnVisibility.category && (
                                                <TableCell>
                                                    {product.category ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                                                            {product.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {columnVisibility.description && (
                                                <TableCell className="max-w-xs truncate">
                                                    {product.description || '-'}
                                                </TableCell>
                                            )}
                                            {columnVisibility.price && (
                                                <TableCell className="font-medium">
                                                    {formatPrice(product.price)}
                                                </TableCell>
                                            )}
                                            {columnVisibility.stock && (
                                                <TableCell>
                                                    {product.stock <= 0 ? (
                                                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                                                            Out of Stock
                                                        </span>
                                                    ) : product.stock <= 10 ? (
                                                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20">
                                                            Low ({product.stock})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                                                            {product.stock}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {columnVisibility.createdAt && (
                                                <TableCell>{formatDate(product.created_at)}</TableCell>
                                            )}
                                            {columnVisibility.actions && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission('products.view') && (
                                                            <Link href={`/products/${product.id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {hasPermission('products.edit') && (
                                                            <Link href={`/products/${product.id}/edit`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {hasPermission('products.delete') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(product)}
                                                            >
                                                                <Trash2 className="size-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {products.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {products.from} to {products.to} of {products.total} products
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/products?page=${products.current_page - 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={products.current_page === 1}
                                        >
                                            Previous
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/products?page=${products.current_page + 1}`}
                                        preserveState
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={products.current_page === products.last_page}
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
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {productToDelete?.name}? This action cannot be
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
