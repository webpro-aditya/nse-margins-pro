<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Illuminate\Http\Client\Response;

class NseApiService
{
    public function __construct(
        private readonly NseTokenService $tokenService,
        private readonly NseMsgIdService $msgIdService,
        private readonly NseCsvParser $csvParser
    ) {}

    public function getCmMargins(string $memCode, string $segment = 'cm'): array
    {
        $payload = [
            'version' => config('nse.api_version', '2.0'),
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
            'version' => config('nse.api_version', '2.0'),
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
            'version' => config('nse.api_version', '2.0'),
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
            ]
        ];

        if (!empty($cliList)) {
            $payload['data']['cliList'] = $cliList;
        }

        return $this->makeRequest('cli-margins', 'cli', $payload, $segment);
    }

    public function getSecurityMargin(string $memCode, ?array $cliList = null, string $segment = 'cm'): array
    {
        $payload = [
            'version' => config('nse.api_version', '2.0'),
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memCode' => (string) $memCode,
            ]
        ];

        if (!empty($cliList)) {
            $payload['data']['cliList'] = $cliList;
        }

        return $this->makeRequest('security-margin', 'security', $payload, $segment);
    }

    public function getSettlementMargin(string $memCode, ?array $cliList = null, string $segment = 'cm'): array
    {
        $payload = [
            'version' => config('nse.api_version', '2.0'),
            'data' => [
                'msgId' => $this->msgIdService->generate(),
                'memberCode' => $memCode,
                'segment' => strtoupper($segment),
            ]
        ];

        if (!empty($cliList)) {
            $payload['data']['cliList'] = $cliList;
        }

        return $this->makeRequest('settlement-margin', 'settlement', $payload, $segment);
    }

    public function triggerBulkGenerate(string $type, string $segment = 'cm'): array
    {
        $payload = [
            'version' => config('nse.api_version', '2.0'),
            'data' => [
                'msgId' => $this->msgIdService->generate(),
            ]
        ];

        // Bulk endpoints format: {type}/generate-all
        $endpoint = "{$type}/generate-all";
        
        $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);
        
        $decryptedJson = $this->decryptResponse($response, $segment);
        $data = json_decode($decryptedJson, true);

        return [
            'status' => $data['status'] ?? 'unknown',
            'code' => $data['data']['code'] ?? null,
            'msgId' => $payload['data']['msgId']
        ];
    }

    public function inquireBulkFile(string $type, string $msgId, string $segment = 'cm')
    {
        $payload = [
            'version' => config('nse.api_version', '2.0'),
            'data' => [
                'msgId' => $msgId,
            ]
        ];

        $endpoint = "{$type}/inquiry";
        $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);

        // For inquiry, the response is a Multipart File stream, not encrypted JSON
        if ($response->successful()) {
            return $response->body();
        }

        throw new RuntimeException("Failed to download bulk file for msgId {$msgId}.");
    }

    private function makeRequest(string $endpoint, string $parserType, array $payload, string $segment): array
    {
        $response = $this->sendEncryptedRequest($endpoint, $payload, $segment);
        
        $decryptedJson = $this->decryptResponse($response, $segment);
        $data = json_decode($decryptedJson, true);

        if (!isset($data['status']) || strtoupper($data['status']) !== 'SUCCESS') {
            Log::error("NSE API Error ({$endpoint}): " . ($decryptedJson ?: 'Empty body'));
            throw new RuntimeException("API returned non-success status for {$endpoint}.");
        }

        if (empty($data['data']) || !is_array($data['data'])) {
            return []; // No data available
        }

        return $this->csvParser->parse($data['data'], $parserType, $segment);
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

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $tokenData['enc_access_token'],
            'nonce' => generateNseNonce(),
            'consumerKey' => config('nse.consumer_key'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
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
