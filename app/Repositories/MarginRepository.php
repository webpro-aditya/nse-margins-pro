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
        $date = $date ?? CmMargin::where('mem_code', $memberCode)->max('margin_date');
        $page = request()->get('cm_page', 1);
        $cacheKey = "cm_margins_{$memberCode}_{$date}_page_{$page}";

        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, function () use ($memberCode, $date) {
                $query = CmMargin::where('mem_code', $memberCode);
                if ($date) {
                    $query->whereDate('margin_date', $date);
                }
                return $query->paginate(30, ['*'], 'cm_page');
            });
        }

        $query = CmMargin::where('mem_code', $memberCode);
        if ($date) {
            $query->whereDate('margin_date', $date);
        }
        return $query->paginate(30, ['*'], 'cm_page');
    }

    public function getTmMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
        $page = request()->get('tm_page', 1);
        $cacheKey = "tm_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, function () use ($memberCode, $segment, $date) {
                $query = TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
                if ($date) {
                    $query->whereDate('margin_date', $date);
                }
                return $query->paginate(30, ['*'], 'tm_page');
            });
        }

        $query = TmMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
        if ($date) {
            $query->whereDate('margin_date', $date);
        }
        return $query->paginate(30, ['*'], 'tm_page');
    }

    public function getCliMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? CliMargin::where('mem_code', $memberCode)->where('segment', $segment)->max('margin_date');
        $page = request()->get('cli_page', 1);
        $cacheKey = "cli_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, function () use ($memberCode, $segment, $date) {
                $query = CliMargin::where('mem_code', $memberCode)->where('segment', $segment);
                if ($date) {
                    $query->whereDate('margin_date', $date);
                }
                return $query->paginate(30, ['*'], 'cli_page');
            });
        }

        $query = CliMargin::where('mem_code', $memberCode)->where('segment', $segment);
        if ($date) {
            $query->whereDate('margin_date', $date);
        }
        return $query->paginate(30, ['*'], 'cli_page');
    }

    public function getSecurityMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
        $page = request()->get('sec_page', 1);
        $cacheKey = "sec_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, function () use ($memberCode, $segment, $date) {
                $query = SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
                if ($date) {
                    $query->whereDate('margin_date', $date);
                }
                return $query->paginate(30, ['*'], 'sec_page');
            });
        }

        $query = SecurityMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
        if ($date) {
            $query->whereDate('margin_date', $date);
        }
        return $query->paginate(30, ['*'], 'sec_page');
    }

    public function getSettlementMargins(string $memberCode, string $segment = 'cm', string $date = null)
    {
        $date = $date ?? SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment)->max('margin_date');
        $page = request()->get('set_page', 1);
        $cacheKey = "set_margins_{$memberCode}_{$segment}_{$date}_page_{$page}";

        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            return Cache::tags(["margins_{$memberCode}"])->remember($cacheKey, self::CACHE_TTL, function () use ($memberCode, $segment, $date) {
                $query = SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
                if ($date) {
                    $query->whereDate('margin_date', $date);
                }
                return $query->paginate(30, ['*'], 'set_page');
            });
        }

        $query = SettlementMargin::where('tm_cp_code', $memberCode)->where('segment', $segment);
        if ($date) {
            $query->whereDate('margin_date', $date);
        }
        return $query->paginate(30, ['*'], 'set_page');
    }

    private function clearCacheForMember(string $memberCode)
    {
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags(["margins_{$memberCode}"])->flush();
        } else {
            $date = now()->toDateString();
            Cache::forget("cm_margins_{$memberCode}_{$date}");
            Cache::forget("tm_margins_{$memberCode}_{$date}");
            Cache::forget("cli_margins_{$memberCode}_{$date}");
            Cache::forget("security_margins_{$memberCode}_{$date}");
            Cache::forget("settlement_margins_{$memberCode}_{$date}");
        }
    }

    public function saveCmMargins(array $data)
    {
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode) {
            CmMargin::where('mem_code', $memberCode)->whereDate('margin_date', now()->toDateString())->delete();
            CmMargin::insert($data);
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
            TmMargin::insert($data);
        });
        $this->clearCacheForMember($memberCode);
    }

    public function saveCliMargins(array $data)
    {
        if (empty($data)) return;
        $segment = $data[0]['segment'] ?? 'CM';
        $memberCode = config('nse.member_code');
        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $memberCode, $segment) {
            CliMargin::where('mem_code', $memberCode)->where('segment', $segment)->whereDate('margin_date', now()->toDateString())->delete();
            CliMargin::insert($data);
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
            SecurityMargin::insert($data);
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
            SettlementMargin::insert($data);
        });
        $this->clearCacheForMember($memberCode);
    }
}
