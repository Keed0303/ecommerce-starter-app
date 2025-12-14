# Dashboard Implementation Guidelines

## Overview
This document provides comprehensive guidelines for the E-commerce Dashboard implementation using Laravel (Backend) and React with react-chartjs-2 (Frontend).

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Backend Structure](#backend-structure)
3. [Frontend Structure](#frontend-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Chart Implementation](#chart-implementation)
7. [Filter System](#filter-system)
8. [Data Flow](#data-flow)
9. [Usage Instructions](#usage-instructions)
10. [Customization Guide](#customization-guide)

---

## System Architecture

### Tech Stack
- **Backend**: Laravel 11.x with Inertia.js
- **Frontend**: React 19.x with TypeScript
- **Charts**: Chart.js 4.x with react-chartjs-2
- **UI Components**: Radix UI with Tailwind CSS
- **Database**: MySQL/PostgreSQL

### Architecture Pattern
- **MVC Pattern** on the backend
- **Component-based architecture** on the frontend
- **Server-side rendering** with Inertia.js
- **Real-time data filtering** without page reloads

---

## Backend Structure

### File Locations
```
app/
├── Http/
│   └── Controllers/
│       └── DashboardController.php
├── Models/
│   ├── User.php
│   ├── Product.php
│   └── Sale.php
database/
├── migrations/
│   ├── 2025_12_09_053935_create_products_table.php
│   └── 2025_12_09_053935_create_sales_table.php
routes/
└── web.php
```

### DashboardController.php
**Location**: `app/Http/Controllers/DashboardController.php`

**Purpose**: Handles all dashboard data requests and metrics calculations

**Key Methods**:
1. `index(Request $request)` - Main controller method that renders dashboard
2. `getMetrics($filterType, $customDate)` - Calculates all dashboard metrics
3. `getSalesByDate($filterType, $customDate)` - Gets sales data for charts
4. `getTopProducts($filterType, $customDate)` - Gets top 5 selling products

**Filter Types Supported**:
- `today` - Shows today's data
- `day` - Shows specific day's data (requires date parameter)
- `month` - Shows current month's data
- `year` - Shows current year's data
- `overall` - Shows all-time data

**Example Usage**:
```php
// The controller automatically handles filter parameters from URL
// Example: /dashboard?filter=month
// Example: /dashboard?filter=day&date=2025-12-01
```

### Models

#### Product Model
**Location**: `app/Models/Product.php`

**Attributes**:
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price (decimal)
- `stock` - Available stock quantity

**Relationships**:
- `sales()` - HasMany relationship with Sale model

#### Sale Model
**Location**: `app/Models/Sale.php`

**Attributes**:
- `id` - Primary key
- `product_id` - Foreign key to products
- `user_id` - Foreign key to users
- `quantity` - Quantity sold
- `unit_price` - Price per unit at time of sale
- `total_price` - Total price (quantity × unit_price)
- `sale_date` - Timestamp of sale

**Relationships**:
- `product()` - BelongsTo relationship with Product model
- `user()` - BelongsTo relationship with User model

---

## Frontend Structure

### File Locations
```
resources/js/
├── pages/
│   └── dashboard.tsx          # Main dashboard component
├── components/
│   └── ui/
│       ├── card.tsx           # Card UI component
│       └── select.tsx         # Select dropdown component
```

### Dashboard Component
**Location**: `resources/js/pages/dashboard.tsx`

**Key Features**:
1. **Metric Cards** - Display total users, sales, and products sold
2. **Line Chart** - Sales overview over time
3. **Bar Chart** - Top 5 products by sales
4. **Pie Chart** - Product distribution visualization
5. **Filter Dropdown** - Change date range dynamically
6. **Date Picker** - Select specific date for daily view

**Component Structure**:
```tsx
Dashboard Component
├── Header with Filter Controls
├── Metric Cards (3 cards)
│   ├── Total Users Card
│   ├── Total Sales Card
│   └── Products Sold Card
├── Charts Grid (2 columns)
│   ├── Sales Overview (Line Chart)
│   └── Top 5 Products (Bar Chart)
└── Product Distribution (Pie Chart)
```

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes (Recommended)
```sql
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_user ON sales(user_id);
```

---

## API Endpoints

### Dashboard Endpoint
**URL**: `/dashboard`
**Method**: GET
**Authentication**: Required (auth, verified middleware)

**Query Parameters**:
| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| filter    | string | No       | Filter type (today/day/month/year/overall) |
| date      | date   | No       | Specific date (YYYY-MM-DD) for 'day' filter |

**Example Requests**:
```
GET /dashboard                          # Today's data (default)
GET /dashboard?filter=month             # Current month data
GET /dashboard?filter=year              # Current year data
GET /dashboard?filter=overall           # All-time data
GET /dashboard?filter=day&date=2025-12-01  # Specific day data
```

**Response Structure** (passed to Inertia as props):
```typescript
{
    metrics: {
        totalUsers: number,
        totalSales: string,           // Formatted with 2 decimals
        totalProductsSold: number,
        salesByDate: {
            labels: string[],         // Time labels (hours/days/months/years)
            data: number[]            // Sales values
        },
        topProducts: {
            labels: string[],         // Product names
            data: number[]            // Quantities sold
        }
    },
    filterType: string                // Current filter type
}
```

---

## Chart Implementation

### Chart.js Configuration

**Registered Components**:
```typescript
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);
```

### Chart Types Used

#### 1. Line Chart - Sales Overview
**Purpose**: Display sales trends over time

**Data Structure**:
```typescript
{
    labels: ['0:00', '1:00', '2:00', ...],  // Time periods
    datasets: [{
        label: 'Sales',
        data: [120.50, 340.00, 210.75, ...], // Sales amounts
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4                          // Smooth curves
    }]
}
```

**Time Granularity by Filter**:
- **Today/Day**: Hourly (0:00 - 23:00)
- **Month**: Daily (Day 1 - Day 31)
- **Year**: Monthly (Jan - Dec)
- **Overall**: Yearly (2020, 2021, 2022...)

#### 2. Bar Chart - Top 5 Products
**Purpose**: Show best-selling products

**Data Structure**:
```typescript
{
    labels: ['Product A', 'Product B', ...],
    datasets: [{
        label: 'Products Sold',
        data: [45, 38, 32, 28, 15],
        backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
        ]
    }]
}
```

#### 3. Pie Chart - Product Distribution
**Purpose**: Visualize product sales distribution

**Uses the same data as Bar Chart** but displays as pie segments

**Chart Options** (Applied to all charts):
```typescript
{
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top'
        }
    }
}
```

---

## Filter System

### Filter Implementation Flow

```
User selects filter → handleFilterChange() →
Router request with filter param → DashboardController →
Database query with date filter → Return filtered metrics →
Update React state → Re-render charts
```

### Filter Component Code
```typescript
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
```

### Date Picker (for Specific Day)
```typescript
{selectedFilter === 'day' && (
    <input
        type="date"
        value={customDate}
        onChange={handleDateChange}
        className="rounded-md border border-input..."
    />
)}
```

**Behavior**:
- Date picker only shows when "Specific Day" filter is selected
- Automatically triggers data fetch on date change
- Uses Inertia's `preserveState: true` to maintain UI state

---

## Data Flow

### Complete Request-Response Cycle

```
┌─────────────────┐
│  User Interface │
│  (Dashboard)    │
└────────┬────────┘
         │
         │ 1. User selects filter
         ↓
┌─────────────────┐
│ React Component │
│ handleFilterChange()
└────────┬────────┘
         │
         │ 2. Inertia.get() request
         ↓
┌─────────────────┐
│ Laravel Router  │
│ /dashboard      │
└────────┬────────┘
         │
         │ 3. Route to controller
         ↓
┌─────────────────────┐
│ DashboardController │
│ index($request)     │
└────────┬────────────┘
         │
         │ 4. Extract filter params
         ↓
┌─────────────────────┐
│ getMetrics()        │
│ - Query database    │
│ - Calculate totals  │
│ - Format data       │
└────────┬────────────┘
         │
         │ 5. Return Inertia response
         ↓
┌─────────────────┐
│ React Component │
│ Re-render with  │
│ new metrics     │
└────────┬────────┘
         │
         │ 6. Update charts
         ↓
┌─────────────────┐
│ Chart.js Render │
│ Visual Update   │
└─────────────────┘
```

---

## Usage Instructions

### Initial Setup

1. **Run Migrations**:
```bash
php artisan migrate
```

2. **Seed Sample Data** (Create a seeder):
```bash
php artisan make:seeder DashboardSeeder
```

Example Seeder:
```php
public function run()
{
    // Create products
    $products = Product::factory(10)->create();

    // Create sales
    $users = User::all();
    foreach ($products as $product) {
        for ($i = 0; $i < 50; $i++) {
            Sale::create([
                'product_id' => $product->id,
                'user_id' => $users->random()->id,
                'quantity' => rand(1, 5),
                'unit_price' => $product->price,
                'total_price' => $product->price * rand(1, 5),
                'sale_date' => now()->subDays(rand(0, 365))
            ]);
        }
    }
}
```

3. **Run Seeder**:
```bash
php artisan db:seed --class=DashboardSeeder
```

4. **Start Development Server**:
```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (React)
npm run dev
```

5. **Access Dashboard**:
```
http://localhost:8000/dashboard
```

---

## Customization Guide

### Adding New Metrics

1. **Add to Controller** (`DashboardController.php`):
```php
private function getMetrics($filterType, $customDate = null)
{
    // ... existing code ...

    // Add new metric
    $averageOrderValue = $query->avg('total_price');

    return [
        // ... existing metrics ...
        'averageOrderValue' => number_format($averageOrderValue, 2),
    ];
}
```

2. **Update Frontend Type** (`dashboard.tsx`):
```typescript
interface DashboardMetrics {
    // ... existing fields ...
    averageOrderValue: string;
}
```

3. **Add New Card**:
```tsx
<Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
        <TrendingUp className="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
        <div className="text-2xl font-bold">${metrics.averageOrderValue}</div>
        <p className="text-xs text-muted-foreground">Average per order</p>
    </CardContent>
</Card>
```

### Adding New Chart Types

**Doughnut Chart Example**:
```typescript
import { Doughnut } from 'react-chartjs-2';

<Doughnut
    data={yourDataStructure}
    options={chartOptions}
/>
```

**Radar Chart Example**:
```typescript
import { Radar } from 'react-chartjs-2';
import { RadialLinearScale } from 'chart.js';

ChartJS.register(RadialLinearScale);

<Radar
    data={yourDataStructure}
    options={chartOptions}
/>
```

### Customizing Chart Colors

**Global Theme Colors** (in `dashboard.tsx`):
```typescript
const primaryColor = 'rgb(59, 130, 246)';      // Blue
const successColor = 'rgb(34, 197, 94)';       // Green
const warningColor = 'rgb(234, 179, 8)';       // Yellow
const dangerColor = 'rgb(239, 68, 68)';        // Red

// Use in chart data
borderColor: primaryColor,
backgroundColor: `${primaryColor}33`,  // Add transparency
```

### Adding New Filter Options

1. **Update Controller**:
```php
switch ($filterType) {
    // ... existing cases ...
    case 'week':
        $query->whereBetween('sale_date', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
        break;
}
```

2. **Update Frontend Select**:
```tsx
<SelectContent>
    {/* ... existing items ... */}
    <SelectItem value="week">This Week</SelectItem>
</SelectContent>
```

---

## Performance Optimization Tips

### Database Optimization
```php
// Use eager loading for relationships
$topProducts = $query->with('product')->get();

// Use select() to limit columns
$sales = Sale::select('id', 'total_price', 'sale_date')->get();

// Add database indexes
Schema::table('sales', function (Blueprint $table) {
    $table->index('sale_date');
});
```

### Frontend Optimization
```typescript
// Memoize chart data
const salesChartData = useMemo(() => ({
    labels: metrics.salesByDate.labels,
    datasets: [...]
}), [metrics.salesByDate]);

// Lazy load charts
const LineChart = lazy(() => import('./components/LineChart'));
```

---

## Troubleshooting

### Common Issues

**Issue**: Charts not displaying
**Solution**: Ensure Chart.js components are registered
```typescript
ChartJS.register(...);
```

**Issue**: Date filter not working
**Solution**: Check date format is YYYY-MM-DD and filter parameter is 'day'

**Issue**: No data showing
**Solution**:
1. Check database has sales records
2. Verify sale_date is within filter range
3. Check Laravel logs for query errors

**Issue**: Metrics showing 0
**Solution**: Ensure sales table has data with matching date range

---

## Security Considerations

1. **Authentication**: Dashboard requires `auth` and `verified` middleware
2. **Authorization**: Consider adding role-based access
3. **SQL Injection**: Use Eloquent ORM (automatic protection)
4. **XSS Protection**: React escapes output automatically
5. **CSRF Protection**: Laravel handles automatically for Inertia requests

---

## Testing Guidelines

### Backend Tests
```php
public function test_dashboard_returns_metrics()
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get('/dashboard');

    $response->assertInertia(fn ($page) =>
        $page->has('metrics')
            ->has('metrics.totalUsers')
            ->has('metrics.totalSales')
    );
}
```

### Frontend Tests (Jest/Vitest)
```typescript
test('renders metric cards', () => {
    render(<Dashboard metrics={mockMetrics} filterType="today" />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
});
```

---

## Maintenance Notes

### Regular Tasks
- Monitor database size (sales table grows over time)
- Archive old sales data (> 2 years)
- Update chart.js dependencies regularly
- Review and optimize slow queries

### Backup Recommendations
- Daily backups of sales data
- Keep backup before major version updates
- Test restore procedures monthly

---

## Additional Resources

- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/
- **react-chartjs-2 Docs**: https://react-chartjs-2.js.org/
- **Laravel Inertia**: https://inertiajs.com/
- **Radix UI Components**: https://www.radix-ui.com/

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0.0   | 2025-12-09 | Initial dashboard implementation |

---

## Support & Contact

For issues or questions regarding this dashboard implementation, please refer to the project documentation or contact the development team.

---

**Created by**: Claude AI Assistant
**Last Updated**: December 9, 2025
**Project**: E-commerce Starter App Dashboard
