<?php

namespace App\Http\Controllers;

use App\Jobs\BulkGenerateJob;
use App\Jobs\FetchMarginsJob;
use App\Services\MwplService;
use App\Services\Nse\NseApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MarginController extends Controller
{
    public function __construct(
        private readonly NseApiService $apiService,
        private readonly MwplService $mwplService
    ) {}

    public function dashboard()
    {
        $memberCode = config('nse.member_code');
        
        // Fetch CM margins for summary card (cached, or direct)
        $cmMargins = Cache::remember("nse:margins:cm:cm", 30, function () use ($memberCode) {
            try {
                return $this->apiService->getCmMargins($memberCode, 'cm');
            } catch (\Exception $e) {
                return [];
            }
        });

        $mwplData = $this->mwplService->getCachedMwplData();
        if (empty($mwplData)) {
            // Trigger background fetch if missing
            \App\Jobs\FetchMwplJob::dispatch();
        }

        return Inertia::render('Dashboard', [
            'cmMargins' => $cmMargins,
            'mwplData' => $mwplData,
        ]);
    }

    public function cmMargins(Request $request)
    {
        $memberCode = config('nse.member_code');
        $segment = $request->get('segment', 'cm');

        // Initial render passes cached or direct fetch data
        $data = Cache::remember("nse:margins:{$segment}:cm", 30, function () use ($memberCode, $segment) {
            try {
                return $this->apiService->getCmMargins($memberCode, $segment);
            } catch (\Exception $e) {
                return [];
            }
        });

        return Inertia::render('Margins/CmMargins', [
            'data' => $data,
            'segment' => $segment,
        ]);
    }

    public function tmMargins(Request $request)
    {
        $memberCode = config('nse.member_code');
        $segment = $request->get('segment', 'cm');

        $data = Cache::remember("nse:margins:{$segment}:tm", 30, function () use ($memberCode, $segment) {
            try {
                return $this->apiService->getTmMargins($memberCode, $segment);
            } catch (\Exception $e) {
                return [];
            }
        });

        return Inertia::render('Margins/TmMargins', [
            'data' => $data,
            'segment' => $segment,
        ]);
    }

    public function cliMargins(Request $request)
    {
        // For client margins, usually it might be filtered by specific clients
        // We'll pass an empty array to fetch all up to the limit
        return Inertia::render('Margins/CliMargins', [
            'segment' => $request->get('segment', 'cm'),
        ]);
    }

    public function securityMargin(Request $request)
    {
        return Inertia::render('Margins/SecurityMargin', [
            'segment' => $request->get('segment', 'cm'),
        ]);
    }

    public function settlementMargin(Request $request)
    {
        return Inertia::render('Margins/SettlementMargin', [
            'segment' => $request->get('segment', 'cm'),
        ]);
    }

    /**
     * API Endpoint to refresh margins asynchronously.
     */
    public function refresh(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:cm,tm,cli,security,settlement',
            'segment' => 'required|string|in:cm,slb',
            'params' => 'nullable|array'
        ]);

        FetchMarginsJob::dispatch(
            $request->input('type'), 
            $request->input('segment'),
            $request->input('params', [])
        );

        return response()->json(['message' => 'Refresh job dispatched']);
    }

    /**
     * API Endpoint to trigger bulk file generation.
     */
    public function triggerBulkGenerate(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:cli-margins,security-margin,settlement-margin',
            'segment' => 'required|string|in:cm,slb'
        ]);

        BulkGenerateJob::dispatch($request->input('type'), $request->input('segment'));

        return response()->json(['message' => 'Bulk generation started']);
    }

    /**
     * Download generated bulk file.
     */
    public function downloadBulkFile(string $filename)
    {
        // Security check to ensure it's in the allowed directory
        if (!Storage::exists($filename)) {
            abort(404, 'File not found');
        }

        return Storage::download($filename);
    }
}
