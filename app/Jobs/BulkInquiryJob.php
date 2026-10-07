<?php

namespace App\Jobs;

use App\Events\BulkFileReady;
use App\Services\Nse\NseApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BulkInquiryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 10;
    public $backoff = [10, 20, 30, 60];

    public function __construct(
        public string $type,
        public string $segment,
        public string $msgId
    ) {}

    public function handle(NseApiService $apiService): void
    {
        try {
            $fileContent = $apiService->inquireBulkFile($this->type, $this->msgId, $this->segment);
            
            // Check if still processing (often API returns JSON error if not ready)
            if (Str::startsWith($fileContent, '{')) {
                $json = json_decode($fileContent, true);
                if (isset($json['status']) && $json['status'] !== 'SUCCESS') {
                    // Release back to queue to retry later with a 10s delay
                    $this->release(10);
                    return;
                }
            }

            // File is ready, save it
            $filename = "bulk-downloads/{$this->msgId}.csv";
            Storage::put($filename, $fileContent);

            BulkFileReady::dispatch($this->type, $this->segment, $this->msgId, $filename);

        } catch (\Exception $e) {
            Log::error("BulkInquiryJob failed for {$this->msgId}: " . $e->getMessage());
            $this->release(10); // Release with 10s delay instead of immediate retry
        }
    }
}
