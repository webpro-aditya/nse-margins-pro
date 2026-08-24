<?php

namespace App\Services\Nse;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class NseTokenService
{
    /**
     * Get the token data for a segment, fetching a new one if necessary.
     */
    public function getToken(string $segment = 'cm'): array
    {
        $cacheKey = "nse:token:{$segment}";

        // Fast path: if token is cached, return it immediately
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Use a lock to prevent multiple concurrent requests for a new token
        $lock = Cache::lock("nse:token-lock:{$segment}", 15);

        try {
            // Block and wait for up to 10 seconds for the lock
            if ($lock->block(10)) {
                // Check cache again after acquiring lock in case another process fetched it
                if (Cache::has($cacheKey)) {
                    return Cache::get($cacheKey);
                }

                $token = $this->fetchNewToken($segment);

                // Cache token using configured TTL (in seconds)
                $ttl = config('nse.token_ttl', 3500);
                Cache::put($cacheKey, $token, $ttl);

                return $token;
            }
        } catch (\Exception $e) {
            Log::error("NSE Token Fetch Error: " . $e->getMessage());
            throw new RuntimeException("Failed to acquire token lock for segment {$segment}.", 0, $e);
        } finally {
            $lock?->release();
        }

        throw new RuntimeException("Could not obtain token for segment {$segment}.");
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
        Cache::forget("nse:token:{$segment}");
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
        
        $authHeader = generateBasicAuthToken($consumerKey, $consumerSecret);
        $nonce = generateNseNonce();

        Log::info("Fetching new NSE token for segment: {$segment}");

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => $authHeader,
            'nonce' => $nonce,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])
        ->asForm()
        ->post($endpoint, [
            'grant_type' => 'client_credentials'
        ]);

        if ($response->failed()) {
            $status = $response->status();
            $body = $response->body();
            Log::error("Failed to generate token. Status: {$status}, Response: {$body}");
            throw new RuntimeException("Token generation failed with status {$status}.");
        }

        $payload = $response->json();
        
        if (!isset($payload['data'])) {
            Log::error("Invalid token response format: " . json_encode($payload));
            throw new RuntimeException("Invalid token response format: 'data' field missing.");
        }

        // The processNseTokenResponse helper decrypts the RSA payload and 
        // adds the 'enc_access_token' field (which is the AES encrypted access token).
        return processNseTokenResponse($payload['data']);
    }
}
