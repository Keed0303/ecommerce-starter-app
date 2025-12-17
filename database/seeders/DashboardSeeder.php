<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding dashboard data...');

        // Create products
        $products = [
            ['name' => 'Laptop Pro 15"', 'description' => 'High-performance laptop with 16GB RAM', 'price' => 1299.99, 'stock' => 50],
            ['name' => 'Wireless Mouse', 'description' => 'Ergonomic wireless mouse with USB receiver', 'price' => 29.99, 'stock' => 200],
            ['name' => 'Mechanical Keyboard', 'description' => 'RGB mechanical keyboard with blue switches', 'price' => 89.99, 'stock' => 100],
            ['name' => 'USB-C Hub', 'description' => '7-in-1 USB-C hub with HDMI and card reader', 'price' => 49.99, 'stock' => 150],
            ['name' => 'Webcam HD', 'description' => '1080p webcam with built-in microphone', 'price' => 79.99, 'stock' => 80],
            ['name' => 'Monitor 27"', 'description' => '4K IPS monitor with HDR support', 'price' => 399.99, 'stock' => 40],
            ['name' => 'Desk Lamp LED', 'description' => 'Adjustable LED desk lamp with touch control', 'price' => 34.99, 'stock' => 120],
            ['name' => 'Headphones Pro', 'description' => 'Noise-cancelling over-ear headphones', 'price' => 249.99, 'stock' => 60],
            ['name' => 'Phone Stand', 'description' => 'Adjustable aluminum phone stand', 'price' => 19.99, 'stock' => 300],
            ['name' => 'Laptop Bag', 'description' => 'Water-resistant laptop backpack', 'price' => 59.99, 'stock' => 100],
        ];

        $this->command->info('Creating products...');
        foreach ($products as $product) {
            Product::create($product);
        }

        // Get all users (or create a test user if none exist)
        $users = User::all();
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Creating test user...');
            $users = collect([
                User::create([
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                ])
            ]);
        }

        $allProducts = Product::all();

        $this->command->info('Creating sales data...');
        $salesCount = 0;

        // Create sales for the last 365 days
        for ($day = 0; $day < 365; $day++) {
            $date = Carbon::now()->subDays($day);

            // Random number of sales per day (0-10)
            $dailySales = rand(0, 10);

            for ($i = 0; $i < $dailySales; $i++) {
                $product = $allProducts->random();
                $quantity = rand(1, 5);
                $unitPrice = $product->price;
                $totalPrice = $quantity * $unitPrice;

                // Random hour of the day
                $saleDateTime = $date->copy()->setHour(rand(0, 23))->setMinute(rand(0, 59));

                Sale::create([
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'sale_date' => $saleDateTime,
                ]);

                $salesCount++;
            }
        }

        $this->command->info("Created {$salesCount} sales records across 365 days");
        $this->command->info('Dashboard seeding completed successfully!');
    }
}
