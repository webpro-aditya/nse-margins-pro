import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import '@/echo';
import { RefreshCw } from 'lucide-react';

interface DashboardProps {
    securityMargins: any[];
    cmMargins: any[];
    tmMargins: any[];
    mwplData: any[];
    segment?: string;
}

export default function Dashboard({ securityMargins: initSecMargins, cmMargins: initCmMargins, tmMargins: initTmMargins, mwplData, segment: initSegment = 'CM' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(initSegment);
  const [liveMwpl, setLiveMwpl] = useState<any[]>(mwplData || []);
  const [securityMargins, setSecurityMargins] = useState<any[]>(initSecMargins || []);
  const [cmMargins, setCmMargins] = useState<any[]>(initCmMargins || []);
  const [tmMargins, setTmMargins] = useState<any[]>(initTmMargins || []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (window.Echo) {
      window.Echo.channel('mwpl')
        .listen('MwplUpdated', (e: any) => {
          setLiveMwpl(e.data);
        });

      window.Echo.private('margins')
        .listen('MarginDataUpdated', (e: any) => {
            const eventSegment = e.dashboardData?.segment || e.segment;
            if (eventSegment?.toLowerCase() !== activeTab.toLowerCase()) return;
            
            router.reload({
                only: ['securityMargins', 'cmMargins', 'tmMargins'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page: any) => {
                    if (page.props.securityMargins) setSecurityMargins(page.props.securityMargins);
                    if (page.props.cmMargins) setCmMargins(page.props.cmMargins);
                    if (page.props.tmMargins) setTmMargins(page.props.tmMargins);
                    setIsRefreshing(false);
                }
            });
        });
    }

    return () => {
        if (window.Echo) {
            window.Echo.leaveChannel('mwpl');
            window.Echo.leaveChannel('margins');
        }
    }
  }, [activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch('/api/margins/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ type: 'security', segment: activeTab.toLowerCase() })
    }).catch(() => {
        setIsRefreshing(false);
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
                onClick={() => {
                  setActiveTab(segment);
                  router.get('/dashboard', { segment: segment.toLowerCase() }, { preserveState: true, preserveScroll: true, replace: true });
                }}
                className={`margin-tab-btn outline-none ${activeTab === segment ? 'active' : ''}`}
              >
                {segment}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col text-center p-2">
            {securityMargins && securityMargins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 bg-white font-bold text-gray-800">
                      <th className="px-2 py-1.5 text-left border-r border-gray-200">TM/CP Code</th>
                      <th className="px-2 py-1.5 text-left border-r border-gray-200">Sett.</th>
                      <th className="px-2 py-1.5 text-left border-r border-gray-200">Client</th>
                      <th className="px-2 py-1.5 text-left border-r border-gray-200">Symbol</th>
                      <th className="px-2 py-1.5 text-right border-r border-gray-200">Total Margin</th>
                      <th className="px-2 py-1.5 text-right border-r border-gray-200">Buy Qty</th>
                      <th className="px-2 py-1.5 text-right border-r border-gray-200">Sell Qty</th>
                      <th className="px-2 py-1.5 text-right">Net Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {securityMargins.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-amber-50/50 text-gray-800">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">{row.tm_cp_code}</td>
                        <td className="px-2 py-1 text-left border-r border-gray-200">{row.settlement_typ_no}</td>
                        <td className="px-2 py-1 text-left border-r border-gray-200">{row.cli_code}</td>
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">{row.symb_ser}</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums font-bold text-indigo-800">{Number(row.total_margin)?.toLocaleString('en-IN')}</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">{Number(row.buy_qty)?.toLocaleString('en-IN')}</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">{Number(row.sell_qty)?.toLocaleString('en-IN')}</td>
                        <td className="px-2 py-1 text-right tabular-nums">{Number(row.net_qty)?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
