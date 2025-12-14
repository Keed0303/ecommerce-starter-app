import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardMetrics {
    totalUsers: number;
    totalSales: string;
    totalProductsSold: number;
    salesByDate: {
        labels: string[];
        data: number[];
    };
    topProducts: {
        labels: string[];
        data: number[];
    };
}

interface DashboardProps {
    metrics: DashboardMetrics;
    filterType: string;
}

export default function Dashboard({ metrics, filterType }: DashboardProps) {
    const [selectedFilter, setSelectedFilter] = useState(filterType || 'today');
    const [customDate, setCustomDate] = useState('');

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        if (value === 'day') {
            return;
        }
        router.get(dashboard().url, { filter: value }, { preserveState: true });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setCustomDate(date);
        router.get(dashboard().url, { filter: 'day', date }, { preserveState: true });
    };

    const salesChartData = {
        labels: metrics.salesByDate.labels,
        datasets: [
            {
                label: 'Sales',
                data: metrics.salesByDate.data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const productChartData = {
        labels: metrics.topProducts.labels,
        datasets: [
            {
                label: 'Products Sold',
                data: metrics.topProducts.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Select value={selectedFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="day">Specific Day</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="overall">Overall</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedFilter === 'day' && (
                            <input
                                type="date"
                                value={customDate}
                                onChange={handleDateChange}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered users on platform</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.totalSales}</div>
                            <p className="text-xs text-muted-foreground">
                                {selectedFilter === 'today' ? 'Sales today' : selectedFilter === 'month' ? 'Sales this month' : selectedFilter === 'year' ? 'Sales this year' : 'All-time sales'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                            <Package className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalProductsSold}</div>
                            <p className="text-xs text-muted-foreground">
                                {selectedFilter === 'today' ? 'Products sold today' : selectedFilter === 'month' ? 'Products sold this month' : selectedFilter === 'year' ? 'Products sold this year' : 'All-time product sales'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5" />
                                Sales Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line data={salesChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="size-5" />
                                Top 5 Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar
                                    data={productChartData}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                display: false,
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mx-auto h-[400px] max-w-md">
                            <Pie data={productChartData} options={chartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
