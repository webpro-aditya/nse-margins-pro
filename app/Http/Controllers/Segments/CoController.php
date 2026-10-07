<?php

namespace App\Http\Controllers\Segments;

use App\Http\Controllers\Controller;
use App\Services\Nse\NseApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoController extends Controller
{
    public function __construct(
        private readonly \App\Services\MarginService $marginService
    ) {}

    public function index(Request $request): Response
    {
        $memberCode = config('nse.member_code');
        $segment = 'co';
        $dashboardData = [];
        $error = null;

        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, $segment);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to fetch CO dashboard data: " . $e->getMessage());
            $error = 'Unable to load margin data. Please try again later.';
        }

        return Inertia::render('Margins/SettlementMargin', [
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
