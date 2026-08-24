<?php

namespace App\Services\Nse;

use Illuminate\Support\Str;

class NseCsvParser
{
    /**
     * Parse the raw array of CSV strings into a structured array.
     */
    public function parse(array $rawData, string $type, string $segment): array
    {
        $parsedData = [];

        foreach ($rawData as $rowString) {
            $rowString = trim($rowString);
            if (empty($rowString)) {
                continue;
            }

            // Sometimes the CSV has a trailing comma, sometimes not.
            $fields = str_getcsv($rowString, ',');

            $parsedData[] = match ($type) {
                'cm' => $this->parseCmMargins($fields),
                'tm' => $this->parseTmMargins($fields, $segment),
                'cli' => $this->parseCliMargins($fields, $segment),
                'security' => $this->parseSecurityMargin($fields, $segment),
                'settlement' => $this->parseSettlementMargin($fields, $segment),
                default => $fields, // Fallback to raw fields if type is unknown
            };
        }

        return $parsedData;
    }

    private function parseCmMargins(array $fields): array
    {
        return [
            'memCode' => $this->getVal($fields, 0),
            'cashCollateral' => $this->getFloat($fields, 1),
            'nonCashCollateral' => $this->getFloat($fields, 2),
            'effectiveDeposit' => $this->getFloat($fields, 3),
            'propMargin' => $this->getFloat($fields, 4),
            'tmMargin' => $this->getFloat($fields, 5),
            'totalMargin' => $this->getFloat($fields, 6),
            'utilization' => $this->getFloat($fields, 7),
            'mtmLoss' => $this->getFloat($fields, 8),
            'tradeMargin' => $this->getFloat($fields, 9),
            'icmtm' => $this->getFloat($fields, 10),
        ];
    }

    private function parseTmMargins(array $fields, string $segment): array
    {
        if ($segment === 'slb') {
            return [
                'tmCpCode' => $this->getVal($fields, 0),
                'tmCpName' => $this->getVal($fields, 1),
                'cashCollateral' => $this->getFloat($fields, 2),
                'nonCashCollateral' => $this->getFloat($fields, 3),
                'effectiveDeposit' => $this->getFloat($fields, 4),
                'propMargin' => $this->getFloat($fields, 5),
                'cliMargin' => $this->getFloat($fields, 6),
                'nonCashBenTM' => $this->getFloat($fields, 7),
                'totalMargin' => $this->getFloat($fields, 9),
                'utilization' => $this->getFloat($fields, 10),
                'firstLegMargin' => $this->getFloat($fields, 15),
                'reverseLegMargin' => $this->getFloat($fields, 16),
            ];
        }

        // CM segment
        return [
            'tmCpCode' => $this->getVal($fields, 0),
            'tmCpName' => $this->getVal($fields, 1),
            'cashCollateral' => $this->getFloat($fields, 2),
            'nonCashCollateral' => $this->getFloat($fields, 3),
            'effectiveDeposit' => $this->getFloat($fields, 4),
            'propMargin' => $this->getFloat($fields, 5),
            'cliMargin' => $this->getFloat($fields, 6),
            'nonCashBenTM' => $this->getFloat($fields, 7),
            'nonCashBenCM' => $this->getFloat($fields, 8),
            'totalMargin' => $this->getFloat($fields, 9),
            'utilization' => $this->getFloat($fields, 10),
            'tmCpMargin' => $this->getFloat($fields, 11),
            'mtmLoss' => $this->getFloat($fields, 12),
            'icmtm' => $this->getFloat($fields, 13),
            'tradeMargin' => $this->getFloat($fields, 14),
        ];
    }

    private function parseCliMargins(array $fields, string $segment): array
    {
        if ($segment === 'slb') {
            return [
                'tmCode' => $this->getVal($fields, 2),
                'tmName' => $this->getVal($fields, 3),
                'cliCode' => $this->getVal($fields, 4),
                'cashCollateral' => $this->getFloat($fields, 5),
                'nonCashCollateral' => $this->getFloat($fields, 6),
                'marginOnFirstLeg' => $this->getFloat($fields, 10),
                'marginOnReverseLeg' => $this->getFloat($fields, 11),
                'totalMargin' => $this->getFloat($fields, 12),
                'cliMargin' => $this->getFloat($fields, 13),
                'cliExcessNoncash' => $this->getFloat($fields, 14),
                'eligibleNonCash' => $this->getFloat($fields, 15),
            ];
        }

        // CM segment
        return [
            'memCode' => $this->getVal($fields, 0),
            'memName' => $this->getVal($fields, 1),
            'tmCode' => $this->getVal($fields, 2),
            'tmName' => $this->getVal($fields, 3),
            'cliCode' => $this->getVal($fields, 4),
            'cashCollateral' => $this->getFloat($fields, 5),
            'nonCashCollateral' => $this->getFloat($fields, 6),
            'mtmLoss' => $this->getFloat($fields, 7),
            'tradeMargin' => $this->getFloat($fields, 8),
            'icmtm' => $this->getFloat($fields, 9),
            'marginOnReverseLeg' => $this->getFloat($fields, 11), // As per doc (index 11)
            'totalMargin' => $this->getFloat($fields, 12),
            'cliMargin' => $this->getFloat($fields, 13),
            'cliExcessNoncash' => $this->getFloat($fields, 14),
            'eligibleNonCash' => $this->getFloat($fields, 15),
        ];
    }

    private function parseSecurityMargin(array $fields, string $segment): array
    {
        if ($segment === 'slb') {
            return [
                'tmCpCode' => $this->getVal($fields, 0),
                'settlementTypNo' => $this->getVal($fields, 1),
                'cliCode' => $this->getVal($fields, 2),
                'symbSer' => $this->getVal($fields, 3),
                'totalMargin' => $this->getFloat($fields, 4),
                'buyQty' => $this->getFloat($fields, 7),
                'buyMargin' => $this->getFloat($fields, 8),
                'sellQty' => $this->getFloat($fields, 10),
                'sellMargin' => $this->getFloat($fields, 12),
                'obligation' => $this->getFloat($fields, 13),
                'lendFee' => $this->getFloat($fields, 14),
            ];
        }

        // CM segment
        return [
            'tmCpCode' => $this->getVal($fields, 0),
            'settlementTypNo' => $this->getVal($fields, 1),
            'cliCode' => $this->getVal($fields, 2),
            'symbSer' => $this->getVal($fields, 3),
            'totalMargin' => $this->getFloat($fields, 4),
            'netQty' => $this->getFloat($fields, 5),
            'netVal' => $this->getFloat($fields, 6),
            'buyQty' => $this->getFloat($fields, 7),
            'buyValue' => $this->getFloat($fields, 9),
            'sellQty' => $this->getFloat($fields, 10),
            'sellValue' => $this->getFloat($fields, 11),
            'icmtm' => $this->getFloat($fields, 15),
            'epiQty' => $this->getFloat($fields, 16),
            'epiFunds' => $this->getFloat($fields, 17),
            'eodMTM' => $this->getFloat($fields, 18),
        ];
    }

    private function parseSettlementMargin(array $fields, string $segment): array
    {
        if ($segment === 'slb') {
            return [
                'tmCpCode' => $this->getVal($fields, 0),
                'cliCode' => $this->getVal($fields, 1),
                'settlementTypNo' => $this->getVal($fields, 2),
                'buyMargin' => $this->getFloat($fields, 6),
                'sellMargin' => $this->getFloat($fields, 7),
                'lendFee' => $this->getFloat($fields, 8),
                'totalMargins' => $this->getFloat($fields, 9),
            ];
        }

        // CM segment
        return [
            'tmCpCode' => $this->getVal($fields, 0),
            'cliCode' => $this->getVal($fields, 1),
            'settlementTypNo' => $this->getVal($fields, 2),
            'upfrontMargin' => $this->getFloat($fields, 3),
            'icmtm' => $this->getFloat($fields, 4),
            'mtmLoss' => $this->getFloat($fields, 5),
            'totalMargins' => $this->getFloat($fields, 9),
        ];
    }

    /**
     * Safely get a string value from an array index.
     */
    private function getVal(array $fields, int $index): string
    {
        return isset($fields[$index]) ? trim($fields[$index]) : '';
    }

    /**
     * Safely get a float value from an array index.
     */
    private function getFloat(array $fields, int $index): float
    {
        $val = $this->getVal($fields, $index);
        return is_numeric($val) ? (float) $val : 0.0;
    }
}
