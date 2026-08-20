<?php

namespace App\Events\Auth;

use Illuminate\Foundation\Events\Dispatchable;

class LoginFailed
{
    use Dispatchable;

    public function __construct(
        public readonly string $email,
        public readonly string $ipAddress,
    ) {}
}
