<?php

namespace App\Http\Controllers;

use App\Models\WeavingCalculation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WeavingDashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();

        $counts = WeavingCalculation::selectRaw("
            count(*) as total,
            sum(case when date(calculated_at) = ? then 1 else 0 end) as today,
            sum(case when date(calculated_at) >= ? then 1 else 0 end) as this_week,
            sum(case when roll_status = 'sufficient' then 1 else 0 end) as roll_sufficient,
            sum(case when roll_status = 'short' then 1 else 0 end) as roll_short,
            sum(case when waste_status = 'within' then 1 else 0 end) as waste_within,
            sum(case when waste_status = 'excess' then 1 else 0 end) as waste_excess
        ", [$today, $weekStart])->first();

        $periods = [
            '1w'  => now()->subWeek(),
            '1m'  => now()->subMonth(),
            '3m'  => now()->subMonths(3),
            '6m'  => now()->subMonths(6),
            '12m' => now()->subYear(),
        ];

        $periodCounts = [];
        foreach ($periods as $key => $from) {
            $periodCounts[$key] = WeavingCalculation::selectRaw("
                sum(case when roll_status = 'sufficient' then 1 else 0 end) as roll_sufficient,
                sum(case when roll_status = 'short'     then 1 else 0 end) as roll_short,
                sum(case when waste_status = 'within'   then 1 else 0 end) as waste_within,
                sum(case when waste_status = 'excess'   then 1 else 0 end) as waste_excess
            ")->where('calculated_at', '>=', $from)->first();
        }

        $recentRecords = WeavingCalculation::with(['shiftGroup', 'machine'])
            ->latest('calculated_at')
            ->limit(10)
            ->get();

        return Inertia::render('weaving-dashboard', [
            'counts'       => $counts,
            'periodCounts' => $periodCounts,
            'recentRecords' => $recentRecords,
        ]);
    }
}
