<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
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

    private function getMetrics($filterType, $customDate = null)
    {
        $query = Sale::query();

        switch ($filterType) {
            case 'today':
                $query->whereDate('sale_date', Carbon::today());
                break;
            case 'day':
                if ($customDate) {
                    $query->whereDate('sale_date', Carbon::parse($customDate));
                }
                break;
            case 'month':
                $query->whereYear('sale_date', Carbon::now()->year)
                      ->whereMonth('sale_date', Carbon::now()->month);
                break;
            case 'year':
                $query->whereYear('sale_date', Carbon::now()->year);
                break;
            case 'overall':
                // No date filter
                break;
        }

        $totalUsers = User::count();
        $totalSales = $query->sum('total_price');
        $totalProductsSold = $query->sum('quantity');

        // Get sales data for charts
        $salesByDate = $this->getSalesByDate($filterType, $customDate);
        $topProducts = $this->getTopProducts($filterType, $customDate);

        return [
            'totalUsers' => $totalUsers,
            'totalSales' => number_format($totalSales, 2),
            'totalProductsSold' => $totalProductsSold,
            'salesByDate' => $salesByDate,
            'topProducts' => $topProducts,
        ];
    }

    private function getSalesByDate($filterType, $customDate = null)
    {
        $query = Sale::query();

        switch ($filterType) {
            case 'today':
            case 'day':
                $date = $filterType === 'today' ? Carbon::today() : Carbon::parse($customDate ?? Carbon::today());
                $sales = $query->whereDate('sale_date', $date)
                    ->selectRaw('HOUR(sale_date) as hour, SUM(total_price) as total')
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->get();

                return [
                    'labels' => $sales->pluck('hour')->map(fn($h) => "{$h}:00")->toArray(),
                    'data' => $sales->pluck('total')->toArray(),
                ];

            case 'month':
                $sales = $query->whereYear('sale_date', Carbon::now()->year)
                    ->whereMonth('sale_date', Carbon::now()->month)
                    ->selectRaw('DAY(sale_date) as day, SUM(total_price) as total')
                    ->groupBy('day')
                    ->orderBy('day')
                    ->get();

                return [
                    'labels' => $sales->pluck('day')->map(fn($d) => "Day {$d}")->toArray(),
                    'data' => $sales->pluck('total')->toArray(),
                ];

            case 'year':
                $sales = $query->whereYear('sale_date', Carbon::now()->year)
                    ->selectRaw('MONTH(sale_date) as month, SUM(total_price) as total')
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();

                $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                return [
                    'labels' => $sales->pluck('month')->map(fn($m) => $monthNames[$m - 1])->toArray(),
                    'data' => $sales->pluck('total')->toArray(),
                ];

            case 'overall':
                $sales = $query->selectRaw('YEAR(sale_date) as year, SUM(total_price) as total')
                    ->groupBy('year')
                    ->orderBy('year')
                    ->get();

                return [
                    'labels' => $sales->pluck('year')->toArray(),
                    'data' => $sales->pluck('total')->toArray(),
                ];

            default:
                return ['labels' => [], 'data' => []];
        }
    }

    private function getTopProducts($filterType, $customDate = null)
    {
        $query = Sale::query();

        switch ($filterType) {
            case 'today':
                $query->whereDate('sale_date', Carbon::today());
                break;
            case 'day':
                if ($customDate) {
                    $query->whereDate('sale_date', Carbon::parse($customDate));
                }
                break;
            case 'month':
                $query->whereYear('sale_date', Carbon::now()->year)
                      ->whereMonth('sale_date', Carbon::now()->month);
                break;
            case 'year':
                $query->whereYear('sale_date', Carbon::now()->year);
                break;
        }

        $topProducts = $query->select('product_id')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->with('product')
            ->get();

        return [
            'labels' => $topProducts->map(fn($sale) => $sale->product->name ?? 'Unknown')->toArray(),
            'data' => $topProducts->pluck('total_quantity')->toArray(),
        ];
    }
}
