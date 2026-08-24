import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Download, Columns, ChevronDown } from 'lucide-react';
import Header from '../Components/Common/Header';

export default function CmMargin() {
  const [selectedMarginType, setSelectedMarginType] = useState<string>('total');
  const [clientCode, setClientCode] = useState<string>('');

  // Handle radio route switching
  const handleMarginTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedMarginType(value);
    
    if (value === 'security') {
      router.visit('/security-margin');
    }
  };

  const handleClearAll = () => {
    setClientCode('');
  };

  const handleShow = () => {
    if (!clientCode) {
      alert('Please select a Client Code first.');
      return;
    }
    console.log('Fetching details for:', clientCode);
  };

  return (
    <>
      <Header />

      {/* Sub-Header Title Bar */}
      <div className="bg-[#ededed] border-b border-gray-300 px-3 py-1 flex items-center justify-between">
        <span className="text-[#800000] font-bold text-[11px] tracking-wide uppercase">
          RISK MANAGEMENT - CM
        </span>
        <button title="Mail" className="text-[#800000] hover:text-red-900">
          <Mail className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Sub-navigation Bar */}
      <nav className="bg-[#ededed] border-b border-gray-300 px-3 py-1 flex gap-5 text-[11px]">
        <div className="flex items-center gap-1 font-bold text-[#800000] cursor-pointer hover:underline">
          <span>MARGINS</span>
          <span className="text-[8px]">▼</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-[#800000] cursor-pointer hover:underline">
          <span>COLLATERALS</span>
          <span className="text-[8px]">▼</span>
        </div>
      </nav>

      {/* Main View Container */}
      <main className="p-3 space-y-4 bg-[#ededed] min-h-screen">

        {/* TM Margin Filter Radio Options */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-gray-700 uppercase">TM MARGIN</div>
          <div className="flex items-center gap-6 text-[11px] text-gray-700">
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-black">
              <input
                type="radio"
                name="tm_margin_filter"
                value="total"
                checked={selectedMarginType === 'total'}
                onChange={handleMarginTypeChange}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-0"
              />
              <span>Total Margins</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tm_margin_filter"
                value="settlement"
                checked={selectedMarginType === 'settlement'}
                onChange={handleMarginTypeChange}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-0"
              />
              <span>Settlement Level Margins</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tm_margin_filter"
                value="security"
                checked={selectedMarginType === 'security'}
                onChange={handleMarginTypeChange}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-0"
              />
              <span>Security Margins</span>
            </label>
          </div>
        </div>

        {/* Section 1: Margin Summary */}
        <section className="space-y-0.5">
          <h2 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            MARGIN SUMMARY @ <span>12 AUG 2026 13:47:15</span>
          </h2>
          <div className="text-[10px] text-gray-600 font-semibold uppercase">LEVEL 1</div>

          <div className="overflow-x-auto bg-white border border-gray-300 shadow-sm">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#800000] text-white font-bold leading-tight select-none">
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap">TM/CP CODE <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap">TM/CP NAME <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap">TM CASH (A) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap">TM NON-CASH (B) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">TM/CP EFFECTIVE<br />DEPOSIT(C =<br />A+MIN(A,B)) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">TM PROP/CP<br />MARGINS (D) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">CLI MARGIN &gt; 90%<br />(E) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">NON-CASH<br />BENEFIT FROM TM =<br />EXCESS CASH(F)</th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">NON-CASH<br />BENEFIT FROM<br />CM EXCESS<br />CASH(G) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-2 py-1.5 text-center whitespace-nowrap leading-tight">TOTAL MARGINS<br />(H=D+E-F-G) <span className="font-normal">=</span></th>
                  <th className="px-2 py-1.5 text-center whitespace-nowrap leading-tight">TM MARGIN<br />UTILISATION (H/C) <span className="font-normal">=</span></th>
                </tr>
              </thead>
              <tbody className="text-black divide-y divide-gray-200">
                <tr className="hover:bg-amber-50/50">
                  <td className="px-2 py-1 text-left border-r border-gray-200">90377</td>
                  <td className="px-2 py-1 text-left border-r border-gray-200 truncate max-w-[130px]" title="ACME CAPITAL MARKET SERVICES LTD">ACME CAPITAL M...</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">10,85,00,000.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">0.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">10,85,00,000.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">7,87,43,152.92</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">72,380.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">0.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">0.00</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums font-semibold">7,88,15,532.92</td>
                  <td className="px-2 py-1 text-right tabular-nums font-semibold">72.64</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: TM Detailed Margins */}
        <section className="space-y-0.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
              TM DETAILED MARGINS @ <span>12 AUG 2026 13:47:15</span>
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <button className="hover:text-black" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="hover:text-black" title="Column Settings">
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 font-semibold uppercase">LEVEL 1</div>

          <div className="overflow-x-auto bg-white border border-gray-300 shadow-sm">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#800000] text-white font-bold leading-tight">
                  <th className="border-r border-[#991b1b] px-3 py-1.5 text-center whitespace-nowrap">TM CODE <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-3 py-1.5 text-center whitespace-nowrap">TM NAME <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-3 py-1.5 text-center whitespace-nowrap">MTM LOSS (A) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-3 py-1.5 text-center whitespace-nowrap">TRADE MARGINS (B) <span className="font-normal">=</span></th>
                  <th className="border-r border-[#991b1b] px-3 py-1.5 text-center whitespace-nowrap">ICMTM (C) <span className="font-normal">=</span></th>
                  <th className="px-3 py-1.5 text-center whitespace-nowrap">TOTAL MARGINS (D = A+B+C) <span className="font-normal">=</span></th>
                </tr>
              </thead>
              <tbody className="bg-white text-black">
                <tr className="hover:bg-amber-50/50">
                  <td className="px-3 py-1.5 text-left border-r border-gray-200">90377</td>
                  <td className="px-3 py-1.5 text-left border-r border-gray-200 font-semibold">ACME CAPITAL MARKET LTD</td>
                  <td className="px-3 py-1.5 text-right border-r border-gray-200 tabular-nums">0.00</td>
                  <td className="px-3 py-1.5 text-right border-r border-gray-200 tabular-nums">7,87,43,152.92</td>
                  <td className="px-3 py-1.5 text-right border-r border-gray-200 tabular-nums">0.00</td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">7,87,43,152.92</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Level 2 Client Code Selection Box */}
        <section className="space-y-1.5 pt-1">
          <div className="text-[10px] text-gray-600 font-semibold uppercase">LEVEL 2</div>
          <div className="flex items-end gap-3">
            
            <div className="flex flex-col gap-1 w-44">
              <label htmlFor="client-code-select" className="text-[10.5px] text-gray-600 font-medium">
                Client Code
              </label>
              <div className="relative">
                <select
                  id="client-code-select"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  className="w-full bg-white border border-gray-400 text-gray-800 text-[11px] px-2 py-1 pr-6 rounded-none outline-none focus:border-blue-600 appearance-none"
                >
                  <option value="" disabled hidden>Select Client Code</option>
                  <option value="ALL">All</option>
                  <option value="ACML1515">ACML1515</option>
                  <option value="ACML1406">ACML1406</option>
                  <option value="ACML1652">ACML1652</option>
                  <option value="ACML1740">ACML1740</option>
                  <option value="ACML1343">ACML1343</option>
                  <option value="ACML1733">ACML1733</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-600">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="bg-[#4a4a4a] hover:bg-[#333333] text-white text-[11px] font-semibold px-6 py-1 border border-black shadow-xs cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleShow}
                className="bg-[#800000] hover:bg-[#600000] text-white text-[11px] font-semibold px-6 py-1 border border-[#4a0000] shadow-xs cursor-pointer"
              >
                Show
              </button>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}