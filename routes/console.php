<?php

use Illuminate\Support\Facades\Schedule;
use App\Jobs\FetchMwplJob;

Schedule::job(new FetchMwplJob)
    ->everyFiveMinutes()
    ->between('9:15', '15:35')
    ->weekdays();

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
