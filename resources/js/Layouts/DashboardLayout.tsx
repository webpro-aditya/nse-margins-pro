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
                <div className="flex items-center justify-around gap-1">
                  <Link href="/margins/cm" className={`margin-badge ${url.includes('/margins/cm') ? 'bg-[#800000] text-white' : ''}`}>CM</Link>
                  <Link href="/margins/fo" className={`margin-badge ${url.includes('/margins/fo') ? 'bg-[#800000] text-white' : ''}`}>FO</Link>
                  <Link href="/margins/cd" className={`margin-badge ${url.includes('/margins/cd') ? 'bg-[#800000] text-white' : ''}`}>CD</Link>
                  <Link href="/margins/co" className={`margin-badge ${url.includes('/margins/co') ? 'bg-[#800000] text-white' : ''}`}>CO</Link>
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
            <h1 className="text-[#800000] font-bold text-[11px] uppercase tracking-wide mb-2">{header || 'DASHBOARD'}</h1>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
