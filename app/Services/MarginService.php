<?php

namespace App\Services;

use App\Repositories\Contracts\MarginRepositoryInterface;
use App\Services\Nse\NseApiService;
use App\Events\MarginDataUpdated;
use Illuminate\Support\Facades\Log;

class MarginService
{
    public function __construct(
        private readonly MarginRepositoryInterface $marginRepository,
        private readonly NseApiService $apiService
    ) {}

    public function getDashboardData(string $memberCode, string $segment = 'cm')
    {
        if (config('nse.mock_api')) {
            $this->ensureMockDataPopulated($memberCode, $segment);
        }

        return [
            'securityMargins' => $this->marginRepository->getSecurityMargins($memberCode, $segment),
            'cmMargins' => $this->marginRepository->getCmMargins($memberCode, $segment),
            'tmMargins' => $this->marginRepository->getTmMargins($memberCode, $segment),
            'settlementMargins' => $this->marginRepository->getSettlementMargins($memberCode, $segment),
            'cliMargins' => $this->marginRepository->getCliMargins($memberCode, $segment),
        ];
    }

    public function ensureMockDataPopulated(string $memberCode, string $segment = 'cm', bool $force = false): void
    {
        $segLower = strtolower($segment);
        $segUpper = strtoupper($segment);
        $today = now()->toDateString();

        // TM margins
        $tmRecord = \App\Models\TmMargin::where('tm_cp_code', $memberCode)
            ->where('segment', $segUpper)
            ->whereDate('margin_date', $today)
            ->first();
        if ($force || !$tmRecord || $tmRecord->total_margin == 0) {
            $this->refreshMargins('tm', $segLower);
        }

        // Security margins
        $secCount = \App\Models\SecurityMargin::where('tm_cp_code', $memberCode)
            ->where('segment', $segUpper)
            ->whereDate('margin_date', $today)
            ->count();
        if ($force || $secCount === 0) {
            $this->refreshMargins('security', $segLower);
        }

        // Settlement margins
        $setCount = \App\Models\SettlementMargin::where('tm_cp_code', $memberCode)
            ->where('segment', $segUpper)
            ->whereDate('margin_date', $today)
            ->count();
        if ($force || $setCount === 0) {
            $this->refreshMargins('settlement', $segLower);
        }

        // CLI margins
        $cliCount = \App\Models\CliMargin::where(function ($q) use ($memberCode) {
                $q->where('mem_code', $memberCode)->orWhere('tm_code', $memberCode);
            })
            ->where('segment', $segUpper)
            ->whereDate('margin_date', $today)
            ->count();
        if ($force || $cliCount === 0) {
            $this->refreshMargins('cli', $segLower);
        }

        // CM segment-level margins
        if ($segLower === 'cm') {
            $cmRecord = \App\Models\CmMargin::where('mem_code', $memberCode)
                ->whereDate('margin_date', $today)
                ->first();
            if ($force || !$cmRecord || $cmRecord->total_margin == 0) {
                $this->refreshMargins('cm', 'cm');
            }
        }
    }

    public function refreshMargins(string $type, string $segment, array $params = [])
    {
        $memberCode = config('nse.member_code');
        
        try {
            switch ($type) {
                case 'cm':
                    if (strtolower($segment) === 'slb') {
                        Log::info("CM margin API is not applicable for SLB segment.");
                        break;
                    }
                    $data = $this->apiService->getCmMargins($memberCode, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveCmMargins($this->mapData($data, 'cm'));
                    }
                    break;
                case 'tm':
                    $data = $this->apiService->getTmMargins($memberCode, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveTmMargins($this->mapData($data, 'tm', $segment));
                    }
                    break;
                case 'cli':
                    $cliList = $params['cliList'] ?? [];
                    $data = $this->apiService->getCliMargins($memberCode, $cliList, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveCliMargins($this->mapData($data, 'cli', $segment));
                    }
                    break;
                case 'security':
                    if (in_array($segment, ['fo', 'cd', 'co']) && !config('nse.mock_api')) {
                        \Illuminate\Support\Facades\Log::warning("NSE Derivatives API does not support security-margin for segment: {$segment}");
                        break;
                    }
                    $cliList = $params['cliList'] ?? null;
                    $data = $this->apiService->getSecurityMargin($memberCode, $cliList, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveSecurityMargins($this->mapData($data, 'security', $segment));
                    }
                    break;
                case 'settlement':
                    if (in_array($segment, ['fo', 'cd']) && !config('nse.mock_api')) {
                        \Illuminate\Support\Facades\Log::warning("NSE Derivatives API does not support settlement-margin for segment: {$segment}");
                        break;
                    }
                    $cliList = $params['cliList'] ?? null;
                    $data = $this->apiService->getSettlementMargin($memberCode, $cliList, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveSettlementMargins($this->mapData($data, 'settlement', $segment));
                    }
                    break;
            }

            // After saving, fetch the updated data for broadcasting
            // Broadcast lightweight notification instead of full payload
            if (!config('nse.mock_api')) {
                broadcast(new MarginDataUpdated(['segment' => $segment, 'type' => $type, 'timestamp' => now()->toIso8601String()]));
            }

        } catch (\Exception $e) {
            Log::error("Failed to refresh margins for $type - $segment: " . $e->getMessage());
            throw $e;
        }
    }

    private function mapData(array $apiData, string $type, string $segment = 'CM'): array
    {
        $mapped = [];
        $date = now()->toDateString();
        
        foreach ($apiData as $row) {
            $snakeRow = [];
            foreach ($row as $key => $value) {
                // Convert camelCase to snake_case
                $snakeKey = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', str_replace('/', '_', $key)));
                
                // Specific manual overrides based on API vs DB discrepancies
                if ($snakeKey === 'effe_deposit') $snakeKey = 'effective_deposit';
                if ($snakeKey === 'cil_margin') $snakeKey = 'cli_margin'; // typo in spec
                if ($snakeKey === 'non_cash_ben_t_m') $snakeKey = 'non_cash_ben_tm';
                if ($snakeKey === 'non_cash_ben_c_m') $snakeKey = 'non_cash_ben_cm';
                if ($snakeKey === 'eod_m_t_m') $snakeKey = 'eod_mtm';
                if ($snakeKey === 'extreme_loss_margin') $snakeKey = 'extrme_loss_margin';
                
                // CLI overrides
                if ($type === 'cli') {
                    if ($snakeKey === 'del_margin') $snakeKey = 'delivery_margin';
                    if ($snakeKey === 'mtm_p_l') $snakeKey = 'mtm_loss';
                    if ($snakeKey === 'total_margins') $snakeKey = 'total_margin';
                    if ($snakeKey === 'ini_margins') $snakeKey = 'ini_margin';
                    if ($snakeKey === 'cm_code') $snakeKey = 'mem_code';
                    if ($snakeKey === 'cm_name') $snakeKey = 'mem_name';
                    if ($snakeKey === 'eligible_noncash') $snakeKey = 'eligible_non_cash';
                }
                
                $snakeRow[$snakeKey] = $value;
            }

            if ($type === 'cli' && empty($snakeRow['mem_code'])) {
                $snakeRow['mem_code'] = $snakeRow['tm_code'] ?? config('nse.member_code', '90377');
            }

            if ($type !== 'cm') {
                $snakeRow['segment'] = strtoupper($segment);
            }
            $snakeRow['margin_date'] = $date;
            $snakeRow['created_at'] = now();
            $snakeRow['updated_at'] = now();
            $mapped[] = $snakeRow;
        }
        
        return $mapped;
    }
}
