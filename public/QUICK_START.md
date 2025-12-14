# Dashboard Quick Start Guide

## Setup Instructions

Follow these steps to get your dashboard up and running:

### 1. Run Database Migrations
```bash
php artisan migrate
```

This will create the following tables:
- `products` - Store product information
- `sales` - Track all sales transactions

### 2. Seed Sample Data
```bash
php artisan db:seed --class=DashboardSeeder
```

This will populate:
- **10 Products** (Laptop, Mouse, Keyboard, etc.)
- **~1,800+ Sales** records spread across the last 365 days
- **1 Test User** (if no users exist)

**Test User Credentials** (if created):
- Email: `test@example.com`
- Password: `password`

### 3. Start Development Servers

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
```

### 4. Access the Dashboard

1. Navigate to: [http://localhost:8000](http://localhost:8000)
2. Login with your user credentials
3. Go to Dashboard: [http://localhost:8000/dashboard](http://localhost:8000/dashboard)

---

## Dashboard Features

### Metrics Cards
- **Total Users**: Shows all registered users
- **Total Sales**: Revenue based on selected filter
- **Products Sold**: Quantity of products sold

### Interactive Charts
1. **Sales Overview** (Line Chart) - Track sales trends
2. **Top 5 Products** (Bar Chart) - Best sellers ranking
3. **Product Distribution** (Pie Chart) - Sales breakdown by product

### Filter Options
- **Today**: Current day sales (hourly breakdown)
- **Specific Day**: Pick any date (hourly breakdown)
- **This Month**: Current month (daily breakdown)
- **This Year**: Current year (monthly breakdown)
- **Overall**: All-time data (yearly breakdown)

---

## Testing the Dashboard

### View Different Time Periods
1. Select "Today" to see today's sales (may be 0 if no sales today)
2. Select "This Month" to see current month
3. Select "This Year" to see 2025 data
4. Select "Overall" to see all seeded data

### View Specific Date
1. Select "Specific Day" from dropdown
2. Pick a date from the last 365 days
3. Dashboard updates with that day's data

### Expected Results
- You should see sales data spread across the year
- Top products will vary by time period
- Charts will update dynamically when changing filters

---

## Troubleshooting

### No data showing?
**Solution**: Run the seeder again:
```bash
php artisan db:seed --class=DashboardSeeder
```

### Charts not displaying?
**Solution**: Check browser console for errors. Ensure npm packages are installed:
```bash
npm install
```

### Migration errors?
**Solution**: Reset and re-run migrations:
```bash
php artisan migrate:fresh
php artisan db:seed --class=DashboardSeeder
```

### Port 8000 already in use?
**Solution**: Use a different port:
```bash
php artisan serve --port=8001
```

---

## Next Steps

### Adding More Data
Manually add sales through Laravel Tinker:
```bash
php artisan tinker
```

```php
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

$product = Product::first();
$user = User::first();

Sale::create([
    'product_id' => $product->id,
    'user_id' => $user->id,
    'quantity' => 2,
    'unit_price' => $product->price,
    'total_price' => $product->price * 2,
    'sale_date' => now()
]);
```

### Customizing the Dashboard
See [DASHBOARD_GUIDELINES.md](DASHBOARD_GUIDELINES.md) for:
- Adding new metrics
- Creating new chart types
- Customizing colors and styles
- Performance optimization tips

### Understanding the System
See [SYSTEM_PROMPT.md](SYSTEM_PROMPT.md) for:
- Architecture overview
- Code patterns
- API documentation
- AI assistance guidelines

---

## Production Deployment

### Build for Production
```bash
# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables
Ensure `.env` is properly configured:
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_DATABASE=your_database
```

---

## Support Files

- **[DASHBOARD_GUIDELINES.md](DASHBOARD_GUIDELINES.md)** - Complete implementation guide
- **[SYSTEM_PROMPT.md](SYSTEM_PROMPT.md)** - System architecture and AI prompts
- **[QUICK_START.md](QUICK_START.md)** - This file

---

**Happy Coding!** 🚀

For questions or issues, refer to the comprehensive documentation in the files above.
