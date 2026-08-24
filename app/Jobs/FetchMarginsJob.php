<?php

namespace App\Jobs;

use App\Events\MarginsUpdated;
use App\Services\Nse\NseApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FetchMarginsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $type,
        public string $segment = 'cm',
        public array $params = []
    ) {}

    public function handle(NseApiService $apiService): void
    {
        $memberCode = config('nse.member_code');
        $data = [];

        try {
            switch ($this->type) {
                case 'cm':
                    $data = $apiService->getCmMargins($memberCode, $this->segment);
                    break;
                case 'tm':
                    $data = $apiService->getTmMargins($memberCode, $this->segment);
                    break;
                case 'cli':
                    $data = $apiService->getCliMargins($memberCode, $this->params['cliList'] ?? [], $this->segment);
                    break;
                case 'security':
                    $data = $apiService->getSecurityMargin($memberCode, $this->params['cliList'] ?? null, $this->segment);
                    break;
                case 'settlement':
                    $data = $apiService->getSettlementMargin($memberCode, $this->params['cliList'] ?? null, $this->segment);
                    break;
            }

            // Cache data with 30s TTL to prevent overwhelming API
            $cacheKey = "nse:margins:{$this->segment}:{$this->type}";
            Cache::put($cacheKey, $data, 30);

            // Broadcast event
            MarginsUpdated::dispatch($this->type, $this->segment, $data);
            
        } catch (\Exception $e) {
            Log::error("FetchMarginsJob failed for {$this->type} ({$this->segment}): " . $e->getMessage());
            $this->fail($e);
        }
    }
}
