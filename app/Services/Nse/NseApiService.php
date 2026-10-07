<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Illuminate\Http\Client\Response;
use App\Models\NseApiLog;

class NseApiService
{
    public function __construct(
        private readonly NseTokenService $tokenService,
        private readonly NseMsgIdService $msgIdService,
        private readonly NseCsvParser $csvParser
    ) {}

    private function logApiCall(string $segment, string $endpoint, array $payload, ?int $status, ?array $responseData, ?string $errorMsg, int $duration): void
    {
        try {
            NseApiLog::create([
                'segment' => $segment,
                'endpoint' => $endpoint,
                'msg_id' => $payload['data']['msgId'] ?? null,
                'request_payload' => $payload,
                'response_status' => $status,
                'response_data' => $responseData,
                'error_message' => $errorMsg,
                'duration_ms' => $duration,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log API call to DB: " . $e->getMessage());
        }
    }

    public function getCmMargins(string $memCode, string $segment = 'cm'): array
    {
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
            ]
        ];

        return $this->makeRequest('cm-margins', 'cm', $payload, $segment);
    }

    public function getTmMargins(string $memCode, string $segment = 'cm'): array
    {
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
            ]
        ];

        return $this->makeRequest('tm-margins', 'tm', $payload, $segment);
    }

    public function getCliMargins(string $memCode, array $cliList = [], string $segment = 'cm'): array
    {
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
                'cliList' => empty($cliList) ? ($segment === 'cm' ? [""] : []) : $cliList,
            ]
        ];

        return $this->makeRequest('cli-margins', 'cli', $payload, $segment);
    }

    public function getSecurityMargin(string $memCode, ?array $cliList = null, string $segment = 'cm'): array
    {
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
                'cliList' => empty($cliList) ? ($segment === 'cm' ? [""] : []) : $cliList,
            ]
        ];

        return $this->makeRequest('security-margin', 'security', $payload, $segment);
    }

    public function getSettlementMargin(string $memCode, ?array $cliList = null, string $segment = 'cm'): array
    {
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
                'cliList' => empty($cliList) ? ($segment === 'cm' ? [""] : []) : $cliList,
            ]
        ];

        return $this->makeRequest('settlement-margin', 'settlement', $payload, $segment);
    }

    public function triggerBulkGenerate(string $type, string $segment = 'cm'): array
    {
        $startTime = microtime(true);
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $this->msgIdService->generate(),
            ]
        ];

        // Bulk endpoints format: {type}/generate-all
        $endpoint = "{$type}/generate-all";
        
        try {
            $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);
            $decryptedJson = $this->decryptResponse($response, $segment);
            $data = json_decode($decryptedJson, true);
            
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $this->logApiCall($segment, $endpoint, $payload, $response->status(), $data, null, $durationMs);

            return [
                'status' => $data['status'] ?? 'unknown',
                'code' => $data['data']['code'] ?? null,
                'msgId' => $payload['data']['msgId']
            ];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $this->logApiCall($segment, $endpoint, $payload, null, null, $e->getMessage(), $durationMs);
            throw $e;
        }
    }

    public function inquireBulkFile(string $type, string $msgId, string $segment = 'cm')
    {
        $startTime = microtime(true);
        $payload = [
            'version' => '2.0',
            'data' => [
                'msgId' => $msgId,
            ]
        ];

        $endpoint = "{$type}/inquiry";
        
        try {
            $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            // For inquiry, the response is a Multipart File stream, not encrypted JSON
            if ($response->successful()) {
                $this->logApiCall($segment, $endpoint, $payload, $response->status(), ['file_downloaded' => true], null, $durationMs);
                return $response->body();
            }

            $this->logApiCall($segment, $endpoint, $payload, $response->status(), null, "Failed to download bulk file for msgId {$msgId}.", $durationMs);
            throw new RuntimeException("Failed to download bulk file for msgId {$msgId}.");
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $this->logApiCall($segment, $endpoint, $payload, null, null, $e->getMessage(), $durationMs);
            throw $e;
        }
    }

    private function makeRequest(string $endpoint, string $parserType, array $payload, string $segment): array
    {
        if (config('nse.mock_api')) {
            $mockRows = [];
            if ($parserType === 'security') {
                for ($i=1; $i<=5000; $i++) {
                    $mockRows[] = "90377,M2026142,CLI" . str_pad($i, 5, '0', STR_PAD_LEFT) . ",DUMMY{$i}," . rand(1000, 99999) . "," . rand(10, 100) . ",0,0,0,0,0,0,0,0,0,0,0,0,0";
                }
            } elseif ($parserType === 'settlement') {
                for ($i=1; $i<=5000; $i++) {
                    $mockRows[] = "90377,CLI" . str_pad($i, 5, '0', STR_PAD_LEFT) . ",M2026142," . rand(1000, 99999) . "," . rand(10, 100) . ",0,0,0,0,0";
                }
            } elseif ($parserType === 'tm') {
                $mockRows[] = "90377,ACME CAPITAL MARKET LTD," . rand(100000, 999999) . ",0,104500000,0,0,0,0," . rand(10000, 99999) . ",0.47";
            } elseif ($parserType === 'cm') {
                $mockRows[] = "90377,104500000,0,104500000,0,0," . rand(10000, 99999) . ",0.47,0,0,0";
            } elseif ($parserType === 'cli') {
                for ($i=1; $i<=50; $i++) {
                    $cliCode = "CLI" . str_pad($i, 5, '0', STR_PAD_LEFT);
                    $mockRows[] = "M2026,DUMMY CLEARING MEMBER,90377,ACME CAPITAL MARKET LTD,{$cliCode}," . rand(1000, 99999) . ",0,0,0,0,0," . rand(10000, 99999) . ",0,0,0,0";
                }
            }
            return $this->csvParser->parse($mockRows, $parserType, $segment);
        }

        $startTime = microtime(true);
        try {
            $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);
            $decryptedJson = $this->decryptResponse($response, $segment);
            $data = json_decode($decryptedJson, true);
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if (!isset($data['status']) || strtoupper($data['status']) !== 'SUCCESS') {
                $errorMsg = 'API returned non-success status.';
                if (isset($data['messages'])) {
                    if (is_array($data['messages'])) {
                        $code = $data['messages']['CODE'] ?? ($data['messages']['code'] ?? '');
                        $msg = $data['messages']['MSG'] ?? ($data['messages']['msg'] ?? '');
                        $errorMsg = trim("NSE Error {$code}: {$msg}");
                        
                        if (in_array($code, ['01140200', '01010244'])) {
                            $this->logApiCall($segment, $endpoint, $payload, $response->status(), $data, "Suppressed expected error (No Data / Permission): {$errorMsg}", $durationMs);
                            return [];
                        }
                    } elseif (is_string($data['messages'])) {
                        $errorMsg = $data['messages'];
                    }
                }
                $this->logApiCall($segment, $endpoint, $payload, $response->status(), $data, $errorMsg, $durationMs);
                throw new RuntimeException($errorMsg);
            }

            // Log successful attempt without dumping entire payload if it's too big, 
            // but we want robust debugging, so let's log the full data
            $this->logApiCall($segment, $endpoint, $payload, $response->status(), $data, null, $durationMs);

            $apiData = $data['data'] ?? [];
            if (is_string($apiData) && !empty(trim($apiData))) {
                $apiData = trim($apiData);
                if (str_starts_with($apiData, '[') && str_ends_with($apiData, ']')) {
                    $apiData = substr($apiData, 1, -1);
                }
                $apiData = [$apiData];
            }

            if (empty($apiData) || !is_array($apiData)) {
                return []; // No data available
            }

            return $this->csvParser->parse($apiData, $parserType, $segment);
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $this->logApiCall($segment, $endpoint, $payload, null, null, $e->getMessage(), $durationMs);
            throw $e;
        }
    }

    private function sendEncryptedRequest(string $endpoint, array $payload, string $segment, bool $isRetry = false): Response
    {
        $baseUrl = config("nse.segments.{$segment}.base_url");
        $version = config('nse.api_version', 'v2');
        $url = "{$baseUrl}/{$version}/request/{$endpoint}";

        $tokenData = $this->tokenService->getToken($segment);

        $encryptedPayload = encryptNseRequestPayload(
            $payload, 
            $tokenData['key'], 
            $tokenData['iv']
        );

        Log::info("Encrypted Request Payload for {$endpoint}: " . json_encode($encryptedPayload));

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $tokenData['enc_access_token'],
            'nonce' => generateNseNonce(),
            'consumerKey' => config('nse.consumer_key'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => '/',
            'Accept-Encoding' => '',
        ])->post($url, $encryptedPayload);

        // Handle Token Expiry
        if ($response->status() === 401) {
            Log::warning("Received 401 Unauthorized for {$url}. Clearing token and retrying.");
            
            if (!$isRetry) {
                $this->tokenService->refreshToken($segment);
                return $this->sendEncryptedRequest($endpoint, $payload, $segment, true);
            }
            
            throw new RuntimeException("NSE API authentication failed after retry. Please check credentials.");
        }

        if ($response->failed()) {
            $body = $response->body();
            $decoded = json_decode($body, true);
            if (isset($decoded['data'])) {
                try {
                    $decryptedString = nseAesDecrypt($decoded['data'], $tokenData['key'], $tokenData['iv']);
                    Log::error("NSE API call failed (DECRYPTED): {$url}. Status: {$response->status()} Body: {$decryptedString}");
                } catch (\Exception $e) {
                    Log::error("NSE API call failed: {$url}. Status: {$response->status()} Body: {$body}");
                }
            } else {
                Log::error("NSE API call failed: {$url}. Status: {$response->status()} Body: {$body}");
            }
            throw new RuntimeException("NSE API call failed with status {$response->status()}.");
        }

        return $response;
    }

    private function decryptResponse(Response $response, string $segment): string
    {
        $responseData = $response->json();
        
        if (!isset($responseData['data'])) {
            // Some error responses are not encrypted, try to parse directly
            if (isset($responseData['status']) && strtolower($responseData['status']) === 'error') {
                $code = $responseData['messages']['code'] ?? 'Unknown';
                throw new RuntimeException("NSE API Error Response. Code: {$code}");
            }
            return json_encode($responseData); // Probably an unencrypted error or unexpected structure
        }

        $tokenData = $this->tokenService->getToken($segment);
        
        try {
            $decryptedString = nseAesDecrypt($responseData['data'], $tokenData['key'], $tokenData['iv']);
            
            // Validate it's valid JSON
            if (!json_validate($decryptedString)) {
                 throw new RuntimeException("Decrypted response is not valid JSON.");
            }
            
            return $decryptedString;
        } catch (\Exception $e) {
            Log::error("Failed to decrypt NSE response: " . $e->getMessage());
            throw new RuntimeException("Failed to decrypt NSE response.", 0, $e);
        }
    }
}
