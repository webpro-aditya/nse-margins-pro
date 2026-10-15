<?php

namespace App\Repositories;

use App\Repositories\Contracts\MarginRepositoryInterface;
use App\Models\CmMargin;
use App\Models\TmMargin;
use App\Models\CliMargin;
use App\Models\SecurityMargin;
use App\Models\SettlementMargin;
use Illuminate\Support\Facades\Cache;

class MarginRepository implements MarginRepositoryInterface
{
    private const CACHE_TTL = 3600; // 1 hour

    public function getCmMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        // Use today's date first; if no data found, fall back to latest available date
        $date = $date ?? now()->toDateString();
        $page = request()->get('cm_page', 1);
        $cacheKey = "cm_margins_{$memberCode}_{$date}_page_{$page}";

        $buildQuery = function () use ($memberCode, $date) {
            $query = CmMargin::where('mem_code', $memberCode)->whereDate('margin_date', $date);
            if ($query->count() === 0) {
                // Fallback: get the latest available date's data
                $latestDate = CmMargin::where('mem_code', $memberCode)->max('margin_date');
                if ($latestDate) {
                    return CmMargin::where('mem_code', $memberCode)->whereDate('margin_date', $latestDate)->paginate(30, ['*'], 'cm_page');
                }
            }
            return $query->paginate(30, ['*'], 'cm_page');
        };

        if (!config('nse.mock_api') && Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, $buildQuery);
        }

        return $buildQuery();
    }

    public function getTmMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? now()->toDateString();
        $page = request()->get('tm_page', 1);
        $cacheKey = "tm_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        $buildQuery = function () use ($memberCode, $segment, $date) {
            $query = TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $date);
            if ($query->count() === 0) {
                $latestDate = TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
                if ($latestDate) {
                    return TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $latestDate)->paginate(30, ['*'], 'tm_page');
                }
            }
            return $query->paginate(30, ['*'], 'tm_page');
        };

        if (!config('nse.mock_api') && Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, $buildQuery);
        }

        return $buildQuery();
    }

    public function getCliMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? now()->toDateString();
        $page = request()->get('cli_page', 1);
        $cacheKey = "cli_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        $buildQuery = function () use ($memberCode, $segment, $date) {
            $query = CliMargin::where(function ($q) use ($memberCode) {
                $q->where('mem_code', $memberCode)->orWhere('tm_code', $memberCode);
            })->where('segment', $segment)->whereDate('margin_date', $date);
            if ($query->count() === 0) {
                $latestDate = CliMargin::where(function ($q) use ($memberCode) {
                    $q->where('mem_code', $memberCode)->orWhere('tm_code', $memberCode);
                })->where('segment', $segment)->max('margin_date');
                if ($latestDate) {
                    return CliMargin::where(function ($q) use ($memberCode) {
                        $q->where('mem_code', $memberCode)->orWhere('tm_code', $memberCode);
                    })->where('segment', $segment)->whereDate('margin_date', $latestDate)->paginate(30, ['*'], 'cli_page');
                }
            }
            return $query->paginate(30, ['*'], 'cli_page');
        };

        if (!config('nse.mock_api') && Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, $buildQuery);
        }

        return $buildQuery();
    }

    public function getSecurityMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? now()->toDateString();
        $page = request()->get('sec_page', 1);
        $cacheKey = "sec_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        $buildQuery = function () use ($memberCode, $segment, $date) {
            $query = SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $date);
            if ($query->count() === 0) {
                $latestDate = SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
                if ($latestDate) {
                    return SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $latestDate)->paginate(30, ['*'], 'sec_page');
                }
            }
            return $query->paginate(30, ['*'], 'sec_page');
        };

        if (!config('nse.mock_api') && Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, $buildQuery);
        }

        return $buildQuery();
    }

    public function getSettlementMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? now()->toDateString();
        $page = request()->get('set_page', 1);
        $cacheKey = "set_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        $buildQuery = function () use ($memberCode, $segment, $date) {
            $query = SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $date);
            if ($query->count() === 0) {
                $latestDate = SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
                if ($latestDate) {
                    return SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', $latestDate)->paginate(30, ['*'], 'set_page');
                }
            }
            return $query->paginate(30, ['*'], 'set_page');
        };

        if (!config('nse.mock_api') && Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, $buildQuery);
        }

        return $buildQuery();
    }

    private function clearCacheForMember(string $memberCode)
    {
        try {
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(["margins_{$memberCode}"])->flush();
            } else {
                // Flush ALL cached margin keys for this member across all segments/pages/dates
                $prefix = config('cache.prefix', 'laravel_cache') . ':';
                $patterns = [
                    "cm_margins_{$memberCode}_*",
                    "tm_margins_{$memberCode}_*",
                    "cli_margins_{$memberCode}_*",
                    "sec_margins_{$memberCode}_*",
                    "set_margins_{$memberCode}_*",
                ];
                try {
                    $redis = \Illuminate\Support\Facades\Redis::connection('cache');
                    foreach ($patterns as $pattern) {
                        $cursor = null;
                        do {
                            [$cursor, $keys] = $redis->scan($cursor ?: 0, ['match' => $prefix . $pattern, 'count' => 100]);
                            if (!empty($keys)) {
                                $redis->del(...$keys);
                            }
                        } while ($cursor);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Cache clear fallback for {$memberCode}: " . $e->getMessage());
                    // Fallback: clear with known date patterns
                    $date = now()->toDateString();
                    foreach (['cm', 'tm', 'cli', 'sec', 'set'] as $type) {
                        for ($page = 1; $page <= 10; $page++) {
                            Cache::forget("{$type}_margins_{$memberCode}_{$date}_page_{$page}");
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Cache clear skipped: " . $e->getMessage());
        }
    }

    public function saveCmMargins(array $data)
    {
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode) {
            CmMargin::where('mem_code', $memberCode)->whereDate('margin_date', now()->toDateString())->delete();
            collect($data)->chunk(500)->each(function ($chunk) {
                CmMargin::insert($chunk->toArray());
            });
        });
        $this->clearCacheForMember($memberCode);
    }

    public function saveTmMargins(array $data)
    {
        if (empty($data)) return;
        $segment = $data[0]['segment'] ?? 'CM';
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode, $segment) {
            TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', now()->toDateString())->delete();
            collect($data)->chunk(500)->each(function ($chunk) {
                TmMargin::insert($chunk->toArray());
            });
        });
        $this->clearCacheForMember($memberCode);
    }

    public function saveCliMargins(array $data)
    {
        if (empty($data)) return;
        $segment = $data[0]['segment'] ?? 'CM';
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode, $segment) {
            CliMargin::where(function ($q) use ($memberCode) {
                $q->where('mem_code', $memberCode)->orWhere('tm_code', $memberCode);
            })->where('segment', $segment)->whereDate('margin_date', now()->toDateString())->delete();
            collect($data)->chunk(500)->each(function ($chunk) {
                CliMargin::insert($chunk->toArray());
            });
        });
        $this->clearCacheForMember($memberCode);
    }

    public function saveSecurityMargins(array $data)
    {
        if (empty($data)) return;
        $segment = $data[0]['segment'] ?? 'CM';
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode, $segment) {
            SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', now()->toDateString())->delete();
            collect($data)->chunk(500)->each(function ($chunk) {
                SecurityMargin::insert($chunk->toArray());
            });
        });
        $this->clearCacheForMember($memberCode);
    }

    public function saveSettlementMargins(array $data)
    {
        if (empty($data)) return;
        $segment = $data[0]['segment'] ?? 'CM';
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode, $segment) {
            SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', now()->toDateString())->delete();
            collect($data)->chunk(500)->each(function ($chunk) {
                SettlementMargin::insert($chunk->toArray());
            });
        });
        $this->clearCacheForMember($memberCode);
    }
}
