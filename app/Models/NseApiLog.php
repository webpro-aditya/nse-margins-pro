<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NseApiLog extends Model
{
    protected $guarded = [];

    protected $casts = [
        'request_payload' => 'array',
        'response_data' => 'array',
    ];
}
