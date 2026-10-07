import { type PropsWithChildren, useState } from 'react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { useFlashMessages } from '@/Hooks/useFlashMessages';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, ArrowRightLeft, Menu, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function V3Layout({ children }: PropsWithChildren) {
    useFlashMessages();
    const { auth } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside 
                className={cn(
                    "fixed md:relative inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-border/40 bg-background/60 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
                    <Link href="/v3/dashboard" className="flex items-center gap-2">
                        <ApplicationLogo size="sm" />
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link href="/v3/dashboard">
                        <Button variant="ghost" className="w-full justify-start font-medium">
                            <LayoutDashboard className="w-4 h-4 mr-3 text-muted-foreground" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/v3/margins/cm">
                        <Button variant="ghost" className="w-full justify-start font-medium">
                            <ArrowRightLeft className="w-4 h-4 mr-3 text-muted-foreground" />
                            Margins (CM)
                        </Button>
                    </Link>
                    <Link href="/v3/margins/fo">
                        <Button variant="ghost" className="w-full justify-start font-medium">
                            <ArrowRightLeft className="w-4 h-4 mr-3 text-muted-foreground" />
                            Margins (FO)
                        </Button>
                    </Link>
                </nav>

                {/* Sidebar Footer (User / Settings) */}
                <div className="p-4 border-t border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                            {auth?.user?.name || 'Test User'}
                        </span>
                        <ModeToggle />
                    </div>
                    <Link 
                        href="/logout" 
                        method="post" 
                        as="button"
                        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Topbar */}
                <header className="md:hidden h-16 border-b border-border/40 bg-background/60 backdrop-blur-md flex items-center px-4 shrink-0 relative z-30">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 text-center font-medium tracking-tight">NSE Margins Pro</div>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto relative z-10 animate-fade-in p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}
