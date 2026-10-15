import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import '../../css/dashboard-style.css';
import {
  Megaphone,
  ChevronDown,
  LayoutGrid,
  ChevronUp,
  LogOut,
} from 'lucide-react';
import { PageProps } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: string;
}

export default function DashboardLayout({ children, header }: DashboardLayoutProps) {
  const { auth } = usePage<PageProps>().props;
  // Open by default so the user sees the segments immediately
  const [isMarginsMenuOpen, setIsMarginsMenuOpen] = useState(true);
  const [isOfsOpen, setIsOfsOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isCollateralOpen, setIsCollateralOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { url } = usePage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-[#ededed] text-[#333333] select-text antialiased min-w-[1280px] min-h-screen font-sans">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-300 px-3 py-1 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="#f26522" strokeWidth="12" strokeDasharray="190 70" strokeLinecap="round" />
                <circle cx="50" cy="50" r="26" fill="#1e3a8a" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-[#1b365d]">NSE</span>
                <span className="text-[9px] font-semibold text-gray-500 tracking-wider">Clearing</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <button title="Announcements" className="hover:text-black">
              <Megaphone className="w-4 h-4" />
            </button>
            <div className="relative" ref={profileMenuRef}>
              <div 
                className="flex items-center gap-1.5 cursor-pointer border-l pl-3 border-gray-300"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-[11px] font-bold text-gray-700">{auth.user.name}</span>
                  <span className="text-[9px] text-gray-400 font-medium">rms</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                  <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-500" />
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Layout Body */}
        <div className="flex min-h-[calc(100vh-42px)]">
          {/* Left Sidebar */}
          <aside className="w-[230px] bg-[#e6e6e6] border-r-[6px] border-[#800000] flex flex-col shrink-0 select-none">
            {/* Top Dashboard Header */}
            <Link 
              href="/dashboard"
              className="p-2 border-b border-gray-300 bg-[#e0e0e0] hover:bg-[#d8d8d8] transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-700 tracking-wide"
            >
              <LayoutGrid className="w-3.5 h-3.5 fill-gray-700 text-gray-700" />
              <span>DASHBOARD</span>
            </Link>

            {/* Sidebar Tiles Container (Scrollable with custom scrollbar) */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-80px)] sidebar-scroll text-center text-[10px] font-bold text-gray-700">
              
              {/* Row 1: ONLINE CP & MARGINS */}
              <div className="grid grid-cols-2">
                <div className="menu-item border-r border-gray-300">ONLINE CP</div>
                <button
                  onClick={() => setIsMarginsMenuOpen(!isMarginsMenuOpen)}
                  className="menu-item flex items-center justify-center gap-1 w-full outline-none"
                >
                  <span>MARGINS</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${
                      isMarginsMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Full-Width Submenu Drawer for MARGINS (4 on row 1, 2 centered on row 2) */}
              <div
                className={`${
                  isMarginsMenuOpen ? 'block' : 'hidden'
                } bg-white border-b border-gray-300 px-2 py-2.5 shadow-inner`}
              >
                {/* Row 1: CM, EGR, FO, CD */}
                <div className="grid grid-cols-4 gap-1 mb-1.5">
                  <Link href="/margins/cm" className={`margin-badge ${url.includes('/margins/cm') ? 'bg-[#800000] text-white' : ''}`}>CM</Link>
                  <Link href="/margins/egr" className={`margin-badge ${url.includes('/margins/egr') ? 'bg-[#800000] text-white' : ''}`}>EGR</Link>
                  <Link href="/margins/fo" className={`margin-badge ${url.includes('/margins/fo') ? 'bg-[#800000] text-white' : ''}`}>FO</Link>
                  <Link href="/margins/cd" className={`margin-badge ${url.includes('/margins/cd') ? 'bg-[#800000] text-white' : ''}`}>CD</Link>
                </div>
                {/* Row 2: CO, SLB */}
                <div className="flex justify-center gap-1">
                  <Link href="/margins/co" className={`margin-badge w-[46px] flex-none ${url.includes('/margins/co') ? 'bg-[#800000] text-white' : ''}`}>CO</Link>
                  <Link href="/margins/slb" className={`margin-badge w-[46px] flex-none ${url.includes('/margins/slb') ? 'bg-[#800000] text-white' : ''}`}>SLB</Link>
                </div>
              </div>

              {/* 2-Column Sidebar Grid Items */}
              <div className="grid grid-cols-2">
                {/* Row 2 */}
                <div className="menu-item leading-tight border-r border-gray-300">CLIENT MARGINS/SA REPORTING</div>
                <div className="menu-item">EXTRANET</div>

                {/* Row 3 */}
                <div className="menu-item border-r border-gray-300">CROSS MARGIN</div>
                <div className="menu-item">MFSS</div>

                {/* Row 4 */}
                <div className="menu-item border-r border-gray-300">BID CANCELLATION</div>
                <div className="menu-item">IMS</div>

                {/* Row 5 */}
                <div className="menu-item border-r border-gray-300">FPI-CLIENT MAPPING</div>
                <div className="menu-item">AUCTION</div>

                {/* Row 6 */}
                <div className="menu-item leading-tight border-r border-gray-300">CD POSITION LIMIT MONITORING</div>
                <div className="menu-item leading-tight">CASH RELEASE TOWARDS FUNDS PAY-IN</div>

                {/* Row 7 */}
                <div className="menu-item leading-tight border-r border-gray-300">FILE MANAGEMENT</div>
                <div className="menu-item leading-tight">MARGIN &amp; COLLATERAL SUMMARY</div>

                {/* Row 8 */}
                <div className="menu-item leading-tight border-r border-gray-300">EXERCISE REQUEST</div>
                <div className="menu-item leading-tight">UNPAID MTF</div>

                {/* Row 9 */}
                <div className="menu-item border-r border-gray-300">CPC</div>
                <div className="menu-item leading-tight">USER MANAGEMENT</div>

                {/* Row 10 */}
                <button
                  onClick={() => setIsOfsOpen(!isOfsOpen)}
                  className="menu-item border-r border-gray-300 flex items-center justify-center gap-1 w-full outline-none"
                >
                  <span>OFS</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${
                      isOfsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => setIsLimitOpen(!isLimitOpen)}
                  className="menu-item flex items-center justify-center gap-1 w-full outline-none leading-tight"
                >
                  <span>LIMIT AND ENABLEMENT</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-gray-600 shrink-0 transition-transform duration-200 ${
                      isLimitOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Row 11 */}
                <button
                  onClick={() => setIsCollateralOpen(!isCollateralOpen)}
                  className="menu-item border-r border-gray-300 flex items-center justify-center gap-1 w-full outline-none leading-tight"
                >
                  <span>COLLATERAL MANAGEMENT</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-gray-600 shrink-0 transition-transform duration-200 ${
                      isCollateralOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className="menu-item">TM CHARGES</div>

                {/* Row 12 */}
                <div className="menu-item border-r border-gray-300">EPI</div>
                <div className="menu-item">USER MANUAL</div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-3">
            <h1 className="text-[#800000] font-bold text-[11px] uppercase tracking-wide mb-2">{header || 'DASHBOARD'}</h1>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
