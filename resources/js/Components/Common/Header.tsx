import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Megaphone, ChevronDown, LogOut } from 'lucide-react';

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    <header className="bg-white border-b border-gray-300 px-3 py-1 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <a href="/dashboard" className="flex items-center gap-1.5">
          <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#f26522" strokeWidth="12" strokeDasharray="190 70" strokeLinecap="round" />
            <circle cx="50" cy="50" r="26" fill="#1e3a8a" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight text-[#1b365d]">NSE</span>
            <span className="text-[9px] font-semibold text-gray-500 tracking-wider">Clearing</span>
          </div>
        </a>
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
              <span className="text-[11px] font-bold text-gray-700">ACME C...</span>
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
  );
}
