<?php

namespace App\Http\Controllers;

use App\Jobs\BulkGenerateJob;
use App\Jobs\FetchMarginsJob;
use App\Jobs\FetchMwplJob;
use App\Services\MwplService;
use App\Services\Nse\NseApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MarginController extends Controller
{
    public function __construct(
        private readonly \App\Services\MarginService $marginService,
        private readonly MwplService $mwplService
    ) {}

    public function dashboard(\Illuminate\Http\Request $request)
    {
        $memberCode = config('nse.member_code');
        $segment = $request->query('segment', 'cm');
        $dashboardData = [];
        $mwplData = [];
        $error = null;
        
        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, strtolower($segment));

            $mwplData = $this->mwplService->getCachedMwplData();
            if (empty($mwplData)) {
                // Trigger background fetch if missing
                FetchMwplJob::dispatch();
            }
        } catch (\Exception $e) {
            Log::error("Failed to fetch main dashboard data: " . $e->getMessage());
            $error = 'Unable to load dashboard data. Please try again later.';
        }

        return Inertia::render('Dashboard', [
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'mwplData' => $mwplData,
            'segment' => strtoupper($segment),
            'error' => $error,
        ]);
    }

    public function dashboardV2(Request $request)
    {
        $memberCode = config('nse.member_code');
        $segment = $request->query('segment', 'cm');
        $dashboardData = [];
        $mwplData = [];
        $error = null;
        
        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, strtolower($segment));

            $mwplData = $this->mwplService->getCachedMwplData();
            if (empty($mwplData)) {
                // Trigger background fetch if missing
                FetchMwplJob::dispatch();
            }
        } catch (\Exception $e) {
            Log::error("Failed to fetch main dashboard data v2: " . $e->getMessage());
            $error = 'Unable to load dashboard data. Please try again later.';
        }

        return Inertia::render('V2/DashboardV2', [
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'mwplData' => $mwplData,
            'segment' => strtoupper($segment),
            'error' => $error,
        ]);
    }

    public function dashboardV3(Request $request)
    {
        $memberCode = config('nse.member_code');
        $segment = $request->query('segment', 'cm');
        $dashboardData = [];
        $mwplData = [];
        $error = null;
        
        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, strtolower($segment));

            $mwplData = $this->mwplService->getCachedMwplData();
            if (empty($mwplData)) {
                // Trigger background fetch if missing
                FetchMwplJob::dispatch();
            }
        } catch (\Exception $e) {
            Log::error("Failed to fetch main dashboard data v3: " . $e->getMessage());
            $error = 'Unable to load dashboard data. Please try again later.';
        }

        return Inertia::render('V3/DashboardV3', [
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'mwplData' => $mwplData,
            'segment' => strtoupper($segment),
            'error' => $error,
        ]);
    }

    public function marginsV3($segment)
    {
        $memberCode = config('nse.member_code');
        $dashboardData = [];
        $error = null;

        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, $segment);
        } catch (\Exception $e) {
            Log::error("Failed to fetch margins v3 data: " . $e->getMessage());
            $error = 'Unable to load margin data. Please try again later.';
        }

        return Inertia::render('V3/ListingV3', [
            'data' => $dashboardData['cmMargins'] ?? [], // CM defaults
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'cliMargins' => $dashboardData['cliMargins'] ?? [],
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'settlementMargins' => $dashboardData['settlementMargins'] ?? [],
            'segment' => $segment,
            'error' => $error,
        ]);
    }
    public function marginsV2($segment)
    {
        $memberCode = config('nse.member_code');
        $dashboardData = [];
        $error = null;

        try {
            $dashboardData = $this->marginService->getDashboardData($memberCode, $segment);
        } catch (\Exception $e) {
            Log::error("Failed to fetch margins v2 data: " . $e->getMessage());
            $error = 'Unable to load margin data. Please try again later.';
        }

        return Inertia::render('V2/ListingV2', [
            'data' => $dashboardData['cmMargins'] ?? [], // CM defaults
            'tmMargins' => $dashboardData['tmMargins'] ?? [],
            'cmMargins' => $dashboardData['cmMargins'] ?? [],
            'cliMargins' => $dashboardData['cliMargins'] ?? [],
            'securityMargins' => $dashboardData['securityMargins'] ?? [],
            'settlementMargins' => $dashboardData['settlementMargins'] ?? [],
            'segment' => $segment,
            'error' => $error,
        ]);
    }



    /**
     * API Endpoint to refresh margins asynchronously.
     */
    public function refresh(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:cm,tm,cli,security,settlement,total',
            'segment' => 'required|string|in:cm,slb,fo,cd,co',
            'params' => 'nullable|array'
        ]);
        
        $type = $request->input('type');
        $segment = $request->input('segment');
        $params = $request->input('params', []);

        if ($type === 'total') {
            if (strtolower($segment) !== 'slb') {
                FetchMarginsJob::dispatch('cm', $segment, $params);
            }
            FetchMarginsJob::dispatch('tm', $segment, $params);
        } else {
            FetchMarginsJob::dispatch($type, $segment, $params);
        }

        return response()->json(['message' => 'Refresh job dispatched']);
    }

    /**
     * API Endpoint to trigger bulk file generation.
     */
    public function triggerBulkGenerate(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:cli-margins,security-margin,settlement-margin',
            'segment' => 'required|string|in:cm,slb,fo,cd,co'
        ]);

        BulkGenerateJob::dispatch($request->input('type'), $request->input('segment'));

        return response()->json(['message' => 'Bulk generation started']);
    }

    /**
     * Download generated bulk file.
     */
    public function downloadBulkFile(string $filename)
    {
        // Sanitize: strip directory traversal sequences
        $sanitized = basename($filename);

        // Only allow files from the designated bulk directory
        $bulkDir = 'bulk-downloads';
        $path = "{$bulkDir}/{$sanitized}";

        // Security check to ensure it's in the allowed directory
        if (!Storage::exists($path)) {
            abort(404, 'File not found');
        }

        return Storage::download($path);
    }
}
