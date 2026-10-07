<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MarginsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $type, 
        public string $segment, 
        public array $data,
        public ?string $error = null
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("margins.{$this->segment}.{$this->type}"),
        ];
    }
}
