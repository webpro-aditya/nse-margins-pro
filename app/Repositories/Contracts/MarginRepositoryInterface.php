<?php

namespace App\Repositories\Contracts;

interface MarginRepositoryInterface
{
    public function getCmMargins(string $memberCode, string $segment = 'cm', string $date = null);
    public function getTmMargins(string $memberCode, string $segment = 'cm', string $date = null);
    public function getCliMargins(string $memberCode, string $segment = 'cm', string $date = null);
    public function getSecurityMargins(string $memberCode, string $segment = 'cm', string $date = null);
    public function getSettlementMargins(string $memberCode, string $segment = 'cm', string $date = null);

    public function saveCmMargins(array $data);
    public function saveTmMargins(array $data);
    public function saveCliMargins(array $data);
    public function saveSecurityMargins(array $data);
    public function saveSettlementMargins(array $data);
}
