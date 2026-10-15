<?php

namespace App\Http\Controllers\Segments;

use App\Http\Controllers\Controller;
use App\Services\MarginService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SlbController extends Controller
{
    public function __construct(
        private readonly MarginService $marginService
    ) {}

    public function index(Request $request): Response
    {
        $memberCode = config('nse.member_code');
        $segment = 'slb';
        $dashboardData = [];
        $error = null;

        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, $segment);
        } catch (\Exception $e) {
            Log::error("Failed to fetch SLB dashboard data: " . $e->getMessage());
            $error = 'Unable to load margin data. Please try again later.';
        }

        return Inertia::render('Margins/SlbMargins', [
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'cliMargins' => $dashboardData['cliMargins'] ?? [],
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'settlementMargins' => $dashboardData['settlementMargins'] ?? [],
            'segment' => $segment,
            'error' => $error,
        ]);
    }
}
