<?php

return [
    'segments' => [
        'cm' => [
            'base_url' => env('NSE_CM_BASE_URL', 'https://uat.connect2nsccl.com/Margins-CM-API'),
        ],
        'slb' => [
            'base_url' => env('NSE_SLB_BASE_URL', 'https://uat.connect2nsccl.com/Margins-SLB-API'),
        ],
    ],
    'api_version' => env('NSE_API_VERSION', 'v2'),
    'member_code' => env('NSE_MEMBER_CODE'),
    'consumer_key' => env('NSE_CONSUMER_KEY'),
    'consumer_secret' => env('NSE_CONSUMER_SECRET'),
    'private_key_path' => env('NSE_PRIVATE_KEY_PATH', 'app/private/private_key.pem'),
    'token_ttl' => env('NSE_TOKEN_TTL', 3500),
    'rate_limits' => [
        'token' => 60,
        'margins' => 10,
        'generate_all' => 300,
        'inquiry' => 10,
    ],
];
