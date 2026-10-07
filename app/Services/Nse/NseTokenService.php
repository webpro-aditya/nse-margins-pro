<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use App\Models\NseApiLog;

class NseTokenService
{
    private function checkPrivateKey(): void
    {
        $keyPath = config('nse.private_key_path');
        if (!file_exists($keyPath) || !is_readable($keyPath)) {
            throw new RuntimeException("NSE Private key not found or not readable at: {$keyPath}");
        }
    }

    /**
     * Get the token data for a segment, fetching a new one if necessary.
     * Tokens are valid across all segments, so we use a global cache key
     * to avoid 429 Too Many Requests errors.
     */
    public function getToken(string $segment = 'cm'): array
    {
        $this->checkPrivateKey();

        $cacheKey = "nse:token:global";

        // Fast path: if token is cached, return it immediately
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Use a lock to prevent multiple concurrent requests for a new token
        $lock = Cache::lock("nse:token-lock:global", 15);

        try {
            // Block and wait for up to 10 seconds for the lock
            if ($lock->block(10)) {
                // Check cache again after acquiring lock in case another process fetched it
                if (Cache::has($cacheKey)) {
                    return Cache::get($cacheKey);
                }

                // Always fetch from 'cm' base url to avoid rate limits on different endpoints
                $token = $this->fetchNewToken('cm');

                // Cache token using configured TTL (in seconds)
                $ttl = config('nse.token_ttl', 3500);
                Cache::put($cacheKey, $token, $ttl);

                return $token;
            }
        } catch (\Exception $e) {
            Log::error("NSE Token Fetch Error: " . $e->getMessage());
            throw new RuntimeException("Failed to acquire token lock.", 0, $e);
        } finally {
            $lock?->release();
        }

        throw new RuntimeException("Could not obtain token.");
    }

    /**
     * Force refresh the token (typically called when a 401 is encountered).
     */
    public function refreshToken(string $segment = 'cm'): array
    {
        $this->clearToken($segment);
        return $this->getToken($segment);
    }

    /**
     * Clear the cached token.
     */
    public function clearToken(string $segment = 'cm'): void
    {
        Cache::forget("nse:token:global");
    }

    /**
     * Fetch a new token from the API.
     */
    private function fetchNewToken(string $segment): array
    {
        $baseUrl = config("nse.segments.{$segment}.base_url");
        if (!$baseUrl) {
            throw new RuntimeException("Base URL for segment '{$segment}' is not configured.");
        }

        $version = config('nse.api_version', 'v2');
        $endpoint = "{$baseUrl}/{$version}/request/token";
        
        $consumerKey = config('nse.consumer_key');
        $consumerSecret = config('nse.consumer_secret');
        
        $nonce = generateNseNonce();

        Log::info("Fetching new NSE token for segment: {$segment}");

        $startTime = microtime(true);
        $response = Http::withoutVerifying()
            ->withBasicAuth($consumerKey, $consumerSecret)
            ->withHeaders([
                'nonce' => $nonce,
                'Accept' => 'application/json',
            ])
            ->asForm()
            ->post($endpoint, [
                'grant_type' => 'client_credentials'
            ]);
        $durationMs = (int) ((microtime(true) - $startTime) * 1000);

        if ($response->failed()) {
            $status = $response->status();
            $body = $response->body();
            
            try {
                NseApiLog::create([
                    'segment' => $segment,
                    'endpoint' => 'token',
                    'request_payload' => ['grant_type' => 'client_credentials'],
                    'response_status' => $status,
                    'error_message' => "Status: {$status}, Response: {$body}",
                    'duration_ms' => $durationMs,
                ]);
            } catch (\Exception $e) {
                // ignore log error
            }

            Log::error("Failed to generate token. Status: {$status}, Response: {$body}");
            throw new RuntimeException("Token generation failed with status {$status}.");
        }

        $payload = $response->json();
        
        try {
            NseApiLog::create([
                'segment' => $segment,
                'endpoint' => 'token',
                'request_payload' => ['grant_type' => 'client_credentials'],
                'response_status' => $response->status(),
                'response_data' => ['message' => 'Token fetched successfully (Payload encrypted)'],
                'duration_ms' => $durationMs,
            ]);
        } catch (\Exception $e) {
            // ignore log error
        }

        if (!isset($payload['data'])) {
            Log::error("Invalid token response format: " . json_encode($payload));
            throw new RuntimeException("Invalid token response format: 'data' field missing.");
        }

        // The processNseTokenResponse helper decrypts the RSA payload and 
        // adds the 'enc_access_token' field (which is the AES encrypted access token).
        return processNseTokenResponse($payload['data']);
    }
}
