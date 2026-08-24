<?php

namespace App\Jobs;

use App\Services\MwplService;
use App\Events\MwplUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchMwplJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(MwplService $mwplService): void
    {
        try {
            $data = $mwplService->fetchMwplData();
            
            if (!empty($data)) {
                MwplUpdated::dispatch($data);
            }
        } catch (\Exception $e) {
            Log::error("FetchMwplJob failed: " . $e->getMessage());
            $this->fail($e);
        }
    }
}
