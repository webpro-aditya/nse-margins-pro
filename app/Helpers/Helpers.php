<?php

## NSE Margins API Helpers

if (!function_exists('generateBasicAuthToken')) {
    function generateBasicAuthToken(string $consumerKey, string $consumerSecret): string
    {
        $memberCredentials = base64_encode($consumerKey . ':' . $consumerSecret);
        return 'Basic ' . $memberCredentials;
    }
}

if (!function_exists('generateNseNonce')) {
    function generateNseNonce(): string
    {
        $now = new DateTime();
        $plain = $now->format('dmYHisv') . ':' . random_int(100000, 999999);
        return base64_encode($plain);
    }
}

if (!function_exists('decryptNseToken')) {
    /**
     * Decrypt the token response 'data' field.
     */
    function decryptNseToken(string $base64TokenData, string $privateKeyPem): array
    {
        $privateKeyResource = openssl_pkey_get_private($privateKeyPem);
        if ($privateKeyResource === false) {
            throw new RuntimeException('Invalid private key: ' . openssl_error_string());
        }

        $rawCipher = base64_decode($base64TokenData, true);
        if ($rawCipher === false) {
            throw new RuntimeException('Invalid base64 token data.');
        }

        $decrypted = '';
        $ok = openssl_private_decrypt($rawCipher, $decrypted, $privateKeyResource, OPENSSL_PKCS1_PADDING);
        if (!$ok) {
            throw new RuntimeException('RSA decryption failed: ' . openssl_error_string());
        }

        $payload = json_decode($decrypted, true);
        if (!is_array($payload) || !isset($payload['access_token'], $payload['key'], $payload['iv'])) {
            throw new RuntimeException('Unexpected token payload structure: ' . $decrypted);
        }

        return $payload;
    }
}

if (!function_exists('nseAesEncrypt')) {
    function nseAesEncrypt(string $plaintext, string $aesKeyB64, string $aesIvB64): string
    {
        $key = base64_decode($aesKeyB64, true);
        $iv  = base64_decode($aesIvB64, true);

        $cipherText = openssl_encrypt(
            $plaintext,
            'aes-256-cbc',
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($cipherText === false) {
            throw new RuntimeException('AES encryption failed: ' . openssl_error_string());
        }

        return base64_encode($cipherText);
    }
}

if (!function_exists('nseAesDecrypt')) {
    function nseAesDecrypt(string $base64Cipher, string $aesKeyB64, string $aesIvB64): string
    {
        $key = base64_decode($aesKeyB64, true);
        $iv  = base64_decode($aesIvB64, true);
        $cipherBytes = base64_decode($base64Cipher, true);

        $plainText = openssl_decrypt(
            $cipherBytes,
            'aes-256-cbc',
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($plainText === false) {
            throw new RuntimeException('AES decryption failed: ' . openssl_error_string());
        }

        return $plainText;
    }
}

if (!function_exists('generateNseMsgId')) {
    function generateNseMsgId(string $memberCode, int $sequence): string
    {
        $today = (new DateTime())->format('Ymd');
        return $memberCode . $today . str_pad((string)$sequence, 7, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('processNseTokenResponse')) {
    /**
     * Helper function for passing token from Generate Token API
     * 
     * @param string $base64TokenData The base64 'data' field from the generate token response
     * @return array Contains access_token, key, iv, and encrypted_token
     */
    function processNseTokenResponse(string $base64TokenData): array
    {
        $privateKeyPem = file_get_contents(storage_path('app/private/private_key.pem'));
        
        $token = decryptNseToken($base64TokenData, $privateKeyPem);
        
        $access_token = $token['access_token'];
        // Decode to binary for the encryption process only
        $keyBin = base64_decode($token['key']);
        $ivBin = base64_decode($token['iv']);
        
        $encrypted = openssl_encrypt($access_token, 'aes-256-cbc', $keyBin, OPENSSL_RAW_DATA, $ivBin);
        
        // Append the new encrypted token to the original array structure
        $token['enc_access_token'] = base64_encode($encrypted);
        
        return $token;
    }
}

if (!function_exists('encryptNseRequestPayload')) {
    /**
     * Helper function to encrypt the request payload body for NSE APIs.
     * 
     * @param array $requestData The raw request data array (e.g. containing version and data keys)
     * @param string $aesKeyB64 Base64 encoded AES key from token response
     * @param string $aesIvB64 Base64 encoded AES IV from token response
     * @return array The final array payload containing the encrypted 'data' field, ready for json_encode
     */
    function encryptNseRequestPayload(array $requestData, string $aesKeyB64, string $aesIvB64): array
    {
        $plaintextJson = json_encode($requestData);
        $base64AesCiphertext = nseAesEncrypt($plaintextJson, $aesKeyB64, $aesIvB64);
        
        return [
            'data' => $base64AesCiphertext
        ];
    }
}
