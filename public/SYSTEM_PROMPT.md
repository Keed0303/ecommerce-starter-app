# E-commerce Dashboard System Prompt

## Context
This is a Laravel 11 + React 19 + TypeScript e-commerce application with an analytics dashboard. The dashboard displays key metrics including user count, sales data, and product performance with interactive charts using react-chartjs-2.

---

## Project Architecture

### Backend (Laravel)
- **Framework**: Laravel 11.x with Inertia.js
- **Database**: MySQL/PostgreSQL
- **Key Models**: User, Product, Sale
- **Controller**: DashboardController handles all dashboard metrics and filtering

### Frontend (React)
- **Library**: React 19.x with TypeScript
- **Routing**: Inertia.js (server-side rendering)
- **Charts**: Chart.js 4.x with react-chartjs-2
- **UI**: Radix UI components with Tailwind CSS
- **State Management**: React hooks (useState for local state)

### File Structure
```
app/
├── Http/Controllers/DashboardController.php
├── Models/
│   ├── Product.php
│   ├── Sale.php
│   └── User.php
resources/js/
├── pages/dashboard.tsx
├── components/ui/
│   ├── card.tsx
│   └── select.tsx
public/
├── DASHBOARD_GUIDELINES.md
└── SYSTEM_PROMPT.md (this file)
routes/web.php
```

---

## Dashboard Features

### Metrics Displayed
1. **Total Users**: Count of all registered users (from users table)
2. **Total Sales**: Sum of sales based on selected filter
3. **Total Products Sold**: Sum of quantities sold based on selected filter

### Chart Visualizations
1. **Line Chart**: Sales overview over time
   - Today/Day: Hourly breakdown
   - Month: Daily breakdown
   - Year: Monthly breakdown
   - Overall: Yearly breakdown

2. **Bar Chart**: Top 5 best-selling products
   - Shows product names and quantities sold

3. **Pie Chart**: Product distribution
   - Same data as bar chart, different visualization

### Filter System
- **Today**: Current day's data (default)
- **Specific Day**: Choose any date with date picker
- **This Month**: Current month's data
- **This Year**: Current year's data
- **Overall**: All-time data

---

## Database Schema

### Products Table
```sql
id, name, description, price, stock, created_at, updated_at
```

### Sales Table
```sql
id, product_id, user_id, quantity, unit_price, total_price, sale_date, created_at, updated_at
```

### Key Relationships
- Sale belongsTo Product
- Sale belongsTo User
- Product hasMany Sales

---

## API Endpoints

### Dashboard Route
```
GET /dashboard?filter={today|day|month|year|overall}&date={YYYY-MM-DD}
```

**Middleware**: auth, verified

**Response Structure** (Inertia props):
```typescript
{
    metrics: {
        totalUsers: number,
        totalSales: string,
        totalProductsSold: number,
        salesByDate: { labels: string[], data: number[] },
        topProducts: { labels: string[], data: number[] }
    },
    filterType: string
}
```

---

## Key Technologies

### Dependencies
```json
{
    "chart.js": "^4.x",
    "react-chartjs-2": "^5.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-avatar": "^1.x",
    "@inertiajs/react": "^2.x",
    "lucide-react": "^0.x"
}
```

### Chart.js Registered Components
```typescript
CategoryScale, LinearScale, PointElement, LineElement,
BarElement, ArcElement, Title, Tooltip, Legend
```

---

## Code Patterns

### Backend Pattern (DashboardController)
```php
public function index(Request $request)
{
    $filterType = $request->input('filter', 'today');
    $customDate = $request->input('date');
    $metrics = $this->getMetrics($filterType, $customDate);

    return Inertia::render('dashboard', [
        'metrics' => $metrics,
        'filterType' => $filterType,
    ]);
}
```

### Frontend Pattern (Dashboard Component)
```typescript
export default function Dashboard({ metrics, filterType }: DashboardProps) {
    const [selectedFilter, setSelectedFilter] = useState(filterType || 'today');

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        router.get(dashboard().url, { filter: value }, { preserveState: true });
    };

    // Chart data and rendering...
}
```

---

## Common Tasks & Solutions

### Adding a New Metric
1. Update `getMetrics()` in DashboardController
2. Add to return array
3. Update TypeScript interface in dashboard.tsx
4. Create new Card component in JSX

### Adding a New Chart
1. Import chart type from react-chartjs-2
2. Register required Chart.js components
3. Create data structure with labels and datasets
4. Add chart component with data and options

### Changing Filter Logic
1. Update switch statement in `getMetrics()`
2. Update `getSalesByDate()` for chart data
3. Add new SelectItem in frontend if needed

### Database Query Optimization
- Use `select()` to limit columns
- Add indexes on `sale_date`, `product_id`, `user_id`
- Use `with()` for eager loading relationships
- Consider caching for expensive queries

---

## Important Constraints & Rules

### Security
- All dashboard routes require authentication
- Use Eloquent ORM (prevents SQL injection)
- Validate date inputs in controller
- Sanitize user inputs

### Performance
- Limit chart data points (group by hour/day/month/year)
- Use database indexes on frequently queried columns
- Consider pagination for large datasets
- Cache expensive queries (Redis recommended)

### Data Integrity
- Ensure `sale_date` is set correctly on sale creation
- Calculate `total_price` = `quantity` × `unit_price`
- Use database transactions for sale creation
- Validate foreign key constraints

---

## Development Guidelines

### When modifying the dashboard:
1. **Backend changes**: Update DashboardController methods and maintain return structure
2. **Frontend changes**: Keep TypeScript interfaces in sync with backend data
3. **Database changes**: Create migrations, update models, run migrations
4. **Chart changes**: Register new Chart.js components before using
5. **Filter changes**: Update both backend query logic and frontend UI

### Code Style
- **PHP**: Follow PSR-12 standards
- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes

### Testing Approach
- Test filter functionality with different date ranges
- Verify chart data matches database queries
- Test edge cases (no data, single data point)
- Ensure metrics update when filter changes

---

## Common Issues & Fixes

### Charts not rendering
**Cause**: Chart.js components not registered
**Fix**: Add to `ChartJS.register()` call

### Filter not working
**Cause**: Incorrect query parameter or date format
**Fix**: Verify URL params and YYYY-MM-DD format

### Metrics showing 0
**Cause**: No sales data for selected date range
**Fix**: Check database has sales with appropriate sale_date

### TypeScript errors
**Cause**: Interface mismatch with backend data
**Fix**: Update DashboardMetrics interface to match controller response

---

## Extension Points

### Easy to add:
- New metric cards (revenue, conversion rate, etc.)
- Additional chart types (doughnut, radar, scatter)
- More filter options (custom date range, quarter, etc.)
- Export functionality (CSV, PDF reports)
- Real-time updates (using Laravel Echo + WebSockets)

### Requires more effort:
- Multi-store support
- Role-based dashboard views
- Predictive analytics
- Drill-down capabilities
- Advanced filtering (by category, region, etc.)

---

## When asking AI for help with this dashboard:

### Provide this context:
"I'm working on a Laravel + React e-commerce dashboard. The backend uses DashboardController to fetch metrics from a Sales model, and the frontend displays data using react-chartjs-2. The dashboard shows user count, total sales, products sold, and three charts (Line, Bar, Pie). It has a filter system for Today/Day/Month/Year/Overall."

### Specify which part you're working on:
- "Backend: [describe PHP/Laravel question]"
- "Frontend: [describe React/TypeScript question]"
- "Database: [describe migration/query question]"
- "Charts: [describe Chart.js question]"

### Reference relevant files:
- DashboardController.php (backend logic)
- dashboard.tsx (frontend component)
- Sale.php / Product.php (models)
- DASHBOARD_GUIDELINES.md (full documentation)

---

## Quick Reference Commands

### Development
```bash
# Start Laravel server
php artisan serve

# Start Vite dev server
npm run dev

# Run migrations
php artisan migrate

# Create seeder data
php artisan db:seed --class=DashboardSeeder

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### Build for Production
```bash
# Build frontend assets
npm run build

# Optimize Laravel
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Resources

- **Full Documentation**: `/public/DASHBOARD_GUIDELINES.md`
- **Chart.js Docs**: https://www.chartjs.org/
- **react-chartjs-2**: https://react-chartjs-2.js.org/
- **Inertia.js**: https://inertiajs.com/
- **Laravel**: https://laravel.com/docs

---

## Version & Compatibility

- Laravel: 11.x
- PHP: 8.2+
- React: 19.x
- Node.js: 18.x+
- TypeScript: 5.x
- Chart.js: 4.x

---

**Last Updated**: December 9, 2025
**Maintainer**: Development Team
**Purpose**: System prompt for AI assistants working on this dashboard

---

## Example AI Prompts

### Good prompts:
✅ "Add a new metric card showing average order value to the dashboard"
✅ "Modify the line chart to show revenue instead of just sales count"
✅ "Add a weekly filter option that shows last 7 days"
✅ "Optimize the database query in getTopProducts() method"

### Less helpful prompts:
❌ "Make the dashboard better"
❌ "Fix the charts"
❌ "Add more features"
❌ "Improve performance"

Be specific about what you want to add, modify, or fix!
