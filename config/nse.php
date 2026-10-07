<?php

$env = env('NSE_ENV', 'uat'); // 'uat' or 'live'
// Default NSE Domains based on env
$domain = env('NSE_DOMAIN', $env === 'live' ? 'https://api.connect2nsccl.com' : 'https://uat.connect2nsccl.com');

return [
    'env' => $env,
    'mock_api' => env('NSE_MOCK_API', false),
    'domain' => $domain,
    'segments' => [
        'cm' => [
            'base_url' => env('NSE_CM_BASE_URL', "{$domain}/Margins-CM-API"),
        ],
        'slb' => [
            'base_url' => env('NSE_SLB_BASE_URL', "{$domain}/Margins-SLB-API"),
        ],
        'fo' => [
            'base_url' => env('NSE_FO_BASE_URL', "{$domain}/Margins-FO-API"),
        ],
        'cd' => [
            'base_url' => env('NSE_CD_BASE_URL', "{$domain}/Margins-CD-API"),
        ],
        'co' => [
            'base_url' => env('NSE_CO_BASE_URL', "{$domain}/Margins-CO-API"),
        ],
    ],
    'api_version' => env('NSE_API_VERSION', 'v2'),
    'member_code' => env('NSE_MEMBER_CODE'),
    'consumer_key' => env('NSE_CONSUMER_KEY'),
    'consumer_secret' => env('NSE_CONSUMER_SECRET'),
    'private_key_path' => storage_path(env('NSE_PRIVATE_KEY_PATH', 'app/private/private_key.pem')),
    'token_ttl' => env('NSE_TOKEN_TTL', 3500),
    'rate_limits' => [
        'token' => 60,
        'margins' => 10,
        'generate_all' => 300,
        'inquiry' => 10,
    ],
];
