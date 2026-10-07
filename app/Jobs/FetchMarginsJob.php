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

    public int $tries = 3;
    public int $backoff = 30; // seconds between retries
    public int $timeout = 120;

    public function __construct(
        public string $type,
        public string $segment = 'cm',
        public array $params = []
    ) {}

    public function handle(\App\Services\MarginService $marginService): void
    {
        try {
            $marginService->refreshMargins($this->type, $this->segment, $this->params);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("FetchMarginsJob failed for {$this->type} ({$this->segment}): " . $e->getMessage());
            $this->fail($e);
        }
    }
}
