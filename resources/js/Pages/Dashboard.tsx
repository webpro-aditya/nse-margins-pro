import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import '../../css/dashboard-style.css';
import {
  LayoutGrid,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import Header from '../Components/Common/Header';

export default function Dashboard() {
  const [isMarginsMenuOpen, setIsMarginsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('CM');

  return (
    <>
      <Head title="NSE Clearing - Risk Management CM Dashboard" />
      <div className="bg-[#ededed] text-[#333333] select-text antialiased min-w-[1280px] min-h-screen">
        {/* Top Header Bar */}
        <Header />

        {/* Page Layout Body */}
        <div className="flex min-h-[calc(100vh-42px)]">
          {/* Left Sidebar */}
          <aside className="w-[240px] bg-[#e6e6e6] border-r-4 border-[#800000] flex flex-col shrink-0">
            <div className="p-2 border-b border-gray-300 bg-[#e0e0e0] flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-700">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>DASHBOARD</span>
            </div>

            {/* Sidebar Tiles Container */}
            <div className="text-center text-[10px] font-bold text-gray-700">
              
              {/* Row 1: ONLINE CP & MARGINS */}
              <div className="grid grid-cols-2">
                <div className="menu-item border-r border-gray-300">ONLINE CP</div>
                <button
                  onClick={() => setIsMarginsMenuOpen(!isMarginsMenuOpen)}
                  className="menu-item flex items-center justify-center gap-1.5 w-full outline-none"
                >
                  <span>MARGINS</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${
                      isMarginsMenuOpen ? 'rotate-0' : 'rotate-180'
                    }`}
                  />
                </button>
              </div>

              {/* Full-Width Submenu Drawer */}
              <div
                className={`${
                  isMarginsMenuOpen ? 'block' : 'hidden'
                } bg-white border-b border-gray-300 px-2 py-2.5`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Link href="/cm-margin" className="margin-badge">CM</Link>
                  <a href="#" className="margin-badge">EGR</a>
                  <a href="#" className="margin-badge">FO</a>
                  <a href="#" className="margin-badge">CD</a>
                  <a href="#" className="margin-badge">CO</a>
                </div>
              </div>

              {/* Remaining 2-Column Sidebar Grid Items */}
              <div className="grid grid-cols-2">
                <div className="menu-item leading-tight border-r border-gray-300">CLIENT MARGINS/SA REPORTING</div>
                <div className="menu-item">EXTRANET</div>

                <div className="menu-item border-r border-gray-300">CROSS MARGIN</div>
                <div className="menu-item">MFSS</div>

                <div className="menu-item border-r border-gray-300">BID CANCELLATION</div>
                <div className="menu-item">IMS</div>

                <div className="menu-item border-r border-gray-300">FPI-CLIENT MAPPING</div>
                <div className="menu-item">AUCTION</div>

                <div className="menu-item leading-tight border-r border-gray-300">CD POSITION LIMIT MONITORING</div>
                <div className="menu-item leading-tight">CASH RELEASE TOWARDS FUNDS PAY-IN</div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-3">
            <h1 className="text-[#800000] font-bold text-[11px] uppercase tracking-wide mb-2">DASHBOARD</h1>

            <div className="grid grid-cols-2 gap-4 items-start">
              
              {/* Card 1: Collateral & Margin Summary */}
              <div className="bg-white border border-gray-300 shadow-sm min-h-[430px] flex flex-col">
                <div className="bg-[#125ba3] text-white px-3 py-1.5 flex items-center justify-between">
                  <span className="font-bold text-[11px] tracking-wide uppercase">COLLATERAL &amp; MARGIN SUMMARY</span>
                  <div className="flex items-center gap-2">
                    <button title="Refresh" className="hover:opacity-75">
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

                <div className="flex-1 flex items-center justify-center text-center p-6">
                  <span className="text-[#800000] text-[11px] font-semibold">
                    No Data Available for {activeTab}
                  </span>
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
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">MANAPPURAM</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">8,04,31,817.02</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">8,22,05,057</td>
                        <td className="px-2 py-1 text-right tabular-nums">97.84</td>
                      </tr>
                      <tr className="row-alert transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">SAIL</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">20,14,70,843.62</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">21,68,61,410</td>
                        <td className="px-2 py-1 text-right tabular-nums">92.90</td>
                      </tr>
                      <tr className="row-alert transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">BANDHANBNK</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">13,53,82,408.02</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">14,74,42,270</td>
                        <td className="px-2 py-1 text-right tabular-nums">91.82</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">LICI</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">5,87,09,449.13</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">6,64,12,476</td>
                        <td className="px-2 py-1 text-right tabular-nums">88.40</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">INOXWIND</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">12,16,67,843.01</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">14,47,08,707</td>
                        <td className="px-2 py-1 text-right tabular-nums">84.08</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">KAYNES</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">37,59,703.28</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">46,79,418</td>
                        <td className="px-2 py-1 text-right tabular-nums">80.35</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">LICHSGFIN</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">3,62,78,642.45</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">4,51,83,075</td>
                        <td className="px-2 py-1 text-right tabular-nums">80.29</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">CANBK</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">40,06,42,326.01</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">50,43,15,430</td>
                        <td className="px-2 py-1 text-right tabular-nums">79.44</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">IREDA</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">9,18,19,753.00</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">11,90,11,160</td>
                        <td className="px-2 py-1 text-right tabular-nums">77.15</td>
                      </tr>
                      <tr className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-2 py-1 text-left border-r border-gray-200 font-semibold">NMDC</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">38,77,19,213.10</td>
                        <td className="px-2 py-1 text-right border-r border-gray-200 tabular-nums">51,70,37,525</td>
                        <td className="px-2 py-1 text-right tabular-nums">74.99</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="px-2 py-2 flex items-center justify-between text-[10.5px] bg-white border-t border-gray-200 mt-auto">
                  <span className="text-[#800000] text-[10px] font-medium">* NSE Clearing FUTEQ OI is provisional Open Interest</span>
                  <a href="#" className="text-[#800000] hover:underline font-semibold text-[11px]">View Detail</a>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
