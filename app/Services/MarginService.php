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
        return [
            'securityMargins' => $this->marginRepository->getSecurityMargins($memberCode, $segment),
            'cmMargins' => $this->marginRepository->getCmMargins($memberCode, $segment),
            'tmMargins' => $this->marginRepository->getTmMargins($memberCode, $segment),
            'settlementMargins' => $this->marginRepository->getSettlementMargins($memberCode, $segment),
            'cliMargins' => $this->marginRepository->getCliMargins($memberCode, $segment),
        ];
    }

    public function refreshMargins(string $type, string $segment, array $params = [])
    {
        $memberCode = config('nse.member_code');
        
        try {
            switch ($type) {
                case 'cm':
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
                    $cliList = $params['cliList'] ?? null;
                    $data = $this->apiService->getSecurityMargin($memberCode, $cliList, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveSecurityMargins($this->mapData($data, 'security', $segment));
                    }
                    break;
                case 'settlement':
                    $cliList = $params['cliList'] ?? null;
                    $data = $this->apiService->getSettlementMargin($memberCode, $cliList, $segment);
                    if (!empty($data)) {
                        $this->marginRepository->saveSettlementMargins($this->mapData($data, 'settlement', $segment));
                    }
                    break;
            }

            // After saving, fetch the updated data for broadcasting
            // Broadcast lightweight notification instead of full payload
            broadcast(new MarginDataUpdated(['segment' => $segment, 'type' => $type, 'timestamp' => now()->toIso8601String()]));

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
