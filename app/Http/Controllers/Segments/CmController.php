<?php

namespace App\Http\Controllers\Segments;

use App\Http\Controllers\Controller;
use App\Services\MarginService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmController extends Controller
{
    public function __construct(
        private readonly MarginService $marginService
    ) {}

    public function index(Request $request): Response
    {
        $memberCode = config('nse.member_code');
        $segment = 'cm';
        $dashboardData = [];
        $error = null;

        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, $segment);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to fetch CM dashboard data: " . $e->getMessage());
            $error = 'Unable to load margin data. Please try again later.';
        }

        return Inertia::render('Margins/CmMargins', [
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
