import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import '@/echo';
import { RefreshCw } from 'lucide-react';

interface DashboardProps {
    cmMargins: any;
    mwplData: any[];
}

export default function Dashboard({ cmMargins, mwplData }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('CM');
  const [liveMwpl, setLiveMwpl] = useState<any[]>(mwplData || []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (window.Echo) {
      window.Echo.channel('mwpl')
        .listen('MwplUpdated', (e: any) => {
          setLiveMwpl(e.data);
        });
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch('/api/margins/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ type: 'cm', segment: 'cm' })
    }).then(() => {
        setTimeout(() => {
            router.reload({ only: ['cmMargins'] });
            setIsRefreshing(false);
        }, 2000);
    });
  };

  return (
    <DashboardLayout header="DASHBOARD">
      <Head title="NSE Clearing - Risk Management CM Dashboard" />

      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Card 1: Collateral & Margin Summary */}
        <div className="bg-white border border-gray-300 shadow-sm min-h-[430px] flex flex-col">
          <div className="bg-[#125ba3] text-white px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-[11px] tracking-wide uppercase">COLLATERAL &amp; MARGIN SUMMARY</span>
            <div className="flex items-center gap-2">
              <button title="Refresh" className={`hover:opacity-75 ${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button title="Minimize" className="hover:opacity-75 font-bold leading-none text-base">-</button>
            </div>
          </div>

          <div className="flex border-b border-gray-300 bg-[#f8f9fa] px-2 text-[11px] font-bold gap-6">
            {['CM', 'FO', 'CD', 'CO'].map((segment) => (
              <button
                key={segment}
                onClick={() => setActiveTab(segment)}
                className={`margin-tab-btn outline-none ${activeTab === segment ? 'active' : ''}`}
              >
                {segment}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            {activeTab === 'CM' && cmMargins && cmMargins.length > 0 ? (
              <table className="w-full text-[11px] border-collapse text-left border border-gray-200">
                <tbody>
                  <tr className="border-b border-gray-200 bg-white">
                      <th className="px-4 py-2 font-medium text-gray-700">Cash Collateral</th>
                      <td className="px-4 py-2 text-right tabular-nums">{cmMargins[0].cashCollateral.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2 font-medium text-gray-700">Non-Cash Collateral</th>
                      <td className="px-4 py-2 text-right tabular-nums">{cmMargins[0].nonCashCollateral.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-white">
                      <th className="px-4 py-2 font-bold text-indigo-800">Total Margin</th>
                      <td className="px-4 py-2 text-right font-bold tabular-nums text-indigo-800">{cmMargins[0].totalMargin.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2 font-medium text-gray-700">Effective Deposit</th>
                      <td className="px-4 py-2 text-right tabular-nums">{cmMargins[0].effectiveDeposit.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-white">
                      <th className="px-4 py-2 font-medium text-gray-700">Utilization</th>
                      <td className="px-4 py-2 text-right tabular-nums">{cmMargins[0].utilization}%</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <span className="text-[#800000] text-[11px] font-semibold">
                No Data Available for {activeTab}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Market Wide Position Limit */}
        <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
          <div className="bg-[#125ba3] text-white px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-[11px] tracking-wide uppercase">MARKET WIDE POSITION LIMIT</span>
            <div className="flex items-center gap-2">
              <button title="Refresh Table" className="hover:opacity-75">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button title="Minimize" className="hover:opacity-75 font-bold leading-none text-base">-</button>
            </div>
          </div>

          <div className="flex border-b border-gray-300 bg-[#f8f9fa] px-2 text-[11px] font-bold">
            <span className="border-b-2 border-[#125ba3] text-black py-1 px-2 cursor-pointer">FO</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10.5px] border-collapse">
              <thead>
                <tr className="border-b border-gray-300 bg-white font-bold text-gray-800">
                  <th className="px-2 py-1.5 text-left border-r border-gray-200">Symbol</th>
                  <th className="px-2 py-1.5 text-right border-r border-gray-200">NSE Clearing FutEq OI *</th>
                  <th className="px-2 py-1.5 text-right border-r border-gray-200">Limit</th>
                  <th className="px-2 py-1.5 text-right">NSE Clearing FutEq OI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {liveMwpl && liveMwpl.length > 0 ? liveMwpl.map((item, i) => (
                  <tr key={i} className={`transition-colors ${item.percent > 90 ? 'bg-[#ff0000] text-white font-bold row-alert' : 'hover:bg-amber-50/50 text-gray-800'}`}>
                    <td className={`px-2 py-1 text-left border-r ${item.percent > 90 ? 'border-red-500' : 'border-gray-200'} font-semibold`}>{item.symbol}</td>
                    <td className={`px-2 py-1 text-right border-r ${item.percent > 90 ? 'border-red-500' : 'border-gray-200'} tabular-nums`}>{item.oi.toLocaleString('en-IN')}</td>
                    <td className={`px-2 py-1 text-right border-r ${item.percent > 90 ? 'border-red-500' : 'border-gray-200'} tabular-nums`}>{item.limit.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{item.percent}</td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan={4} className="text-center p-4 text-gray-500 font-semibold">No MWPL data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-2 py-2 flex items-center justify-between text-[10.5px] bg-white border-t border-gray-200 mt-auto">
            <span className="text-[#800000] text-[10px] font-medium">* NSE Clearing FUTEQ OI is provisional Open Interest</span>
            <a href="#" className="text-[#800000] hover:underline font-semibold text-[11px]">View Detail</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
