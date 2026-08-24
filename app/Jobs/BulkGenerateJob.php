<?php

namespace App\Jobs;

use App\Services\Nse\NseApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BulkGenerateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $type,
        public string $segment = 'cm'
    ) {}

    public function handle(NseApiService $apiService): void
    {
        try {
            $response = $apiService->triggerBulkGenerate($this->type, $this->segment);
            
            if ($response['status'] === 'SUCCESS') {
                $msgId = $response['msgId'];
                
                // Chain inquiry job to check after a delay
                BulkInquiryJob::dispatch($this->type, $this->segment, $msgId)->delay(now()->addSeconds(10));
            } else {
                Log::error("Bulk generation failed for {$this->type} with code {$response['code']}");
            }
        } catch (\Exception $e) {
            Log::error("BulkGenerateJob failed for {$this->type}: " . $e->getMessage());
            $this->fail($e);
        }
    }
}
