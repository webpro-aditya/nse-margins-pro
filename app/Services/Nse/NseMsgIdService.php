<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Cache;

class NseMsgIdService
{
    /**
     * Generate a unique message ID for NSE API requests.
     * Format: <CODE><YYYYMMDD><nnnnnnn>
     * 
     * @return string
     */
    public function generate(): string
    {
        $memberCode = config('nse.member_code');
        $date = date('Ymd');
        $cacheKey = "nse:msgid:{$date}";

        $sequence = Cache::increment($cacheKey);
        
        // Ensure it expires to avoid clutter
        if ($sequence === 1) {
            Cache::put($cacheKey, 1, 86400); // Set expiry for 24 hours
        }

        return generateNseMsgId($memberCode, $sequence);
    }
}
