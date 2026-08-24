<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Redis;

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
        $redisKey = "nse:msgid:{$date}";

        // Increment the sequence for today
        // This is atomic and thread-safe
        $sequence = Redis::incr($redisKey);
        
        // If it's the first one today, set a 24-hour expiry to clean up old keys
        if ($sequence === 1) {
            Redis::expire($redisKey, 86400); 
        }

        return generateNseMsgId($memberCode, $sequence);
    }
}
