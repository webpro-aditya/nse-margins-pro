<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MwplService
{
    private const NSE_URL = 'https://www.nseindia.com';
    private const MWPL_CSV_URL = 'https://www.nseindia.com/api/market-data-pre-open?key=ALL'; // Example placeholder url, usually finding exact CSV endpoint is needed

    /**
     * Fetch MWPL data from NSE India website.
     */
    public function fetchMwplData(): array
    {
        Log::info("Fetching MWPL data from NSE India...");

        try {
            // Step 1: Get initial cookies from homepage
            $cookieJar = Http::withoutVerifying()->withHeaders($this->getHeaders())->get(self::NSE_URL)->cookies();

            // Step 2: In a real implementation, we would hit the specific MWPL CSV endpoint here.
            // For now, returning a static simulated list representing the parsed MWPL report.
            $data = [
                ['symbol' => 'MANAPPURAM', 'oi' => 80431817.02, 'limit' => 82205057, 'percent' => 97.84],
                ['symbol' => 'SAIL', 'oi' => 201470843.62, 'limit' => 216861410, 'percent' => 92.90],
                ['symbol' => 'BANDHANBNK', 'oi' => 135382408.02, 'limit' => 147442270, 'percent' => 91.82],
                ['symbol' => 'LICI', 'oi' => 58709449.13, 'limit' => 66412476, 'percent' => 88.40],
                ['symbol' => 'INOXWIND', 'oi' => 121667843.01, 'limit' => 144708707, 'percent' => 84.08],
                ['symbol' => 'KAYNES', 'oi' => 3759703.28, 'limit' => 4679418, 'percent' => 80.35],
                ['symbol' => 'LICHSGFIN', 'oi' => 36278642.45, 'limit' => 45183075, 'percent' => 80.29],
                ['symbol' => 'CANBK', 'oi' => 400642326.01, 'limit' => 504315430, 'percent' => 79.44],
                ['symbol' => 'IREDA', 'oi' => 91819753.00, 'limit' => 119011160, 'percent' => 77.15],
                ['symbol' => 'NMDC', 'oi' => 387719213.10, 'limit' => 517037525, 'percent' => 74.99],
            ];

            // Cache for 5 minutes
            Cache::put('mwpl_data', $data, 300);
            return $data;
        } catch (\Exception $e) {
            Log::error("Failed to fetch MWPL data: " . $e->getMessage());
            
            // Return cached data if available, even if expired recently
            return Cache::get('mwpl_data', []);
        }
    }

    public function getCachedMwplData(): array
    {
        return Cache::get('mwpl_data', []);
    }

    private function getHeaders(): array
    {
        return [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9',
            'Connection' => 'keep-alive',
            'Upgrade-Insecure-Requests' => '1',
        ];
    }
}
