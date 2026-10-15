import { type PropsWithChildren, useState } from 'react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { useFlashMessages } from '@/Hooks/useFlashMessages';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LogOut,
    ArrowRightLeft,
    Menu,
    X,
    ChevronDown,
    Coins,
    FileSpreadsheet,
    Users,
    Activity,
    Gavel,
    Ban,
    FileCheck,
    FolderDown,
    Split,
    BarChart3,
    Gauge,
    CreditCard,
    FolderArchive,
    CheckSquare,
    AlertTriangle,
    Layers,
    UserCog,
    Tag,
    SlidersHorizontal,
    Receipt,
    Zap,
    BookOpen
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function V3Layout({ children }: PropsWithChildren) {
    useFlashMessages();
    const page = usePage();
    const url = page?.url || '';
    const { auth } = page.props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Accordion state
    const [marginsExpanded, setMarginsExpanded] = useState(true);
    const [collateralExpanded, setCollateralExpanded] = useState(true);
    const [tradingExpanded, setTradingExpanded] = useState(false);
    const [reportsExpanded, setReportsExpanded] = useState(false);
    const [adminExpanded, setAdminExpanded] = useState(false);

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
                <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
                    {/* Dashboard */}
                    <div>
                        <Link href="/v3/dashboard">
                            <Button 
                                variant={url === '/v3/dashboard' ? 'secondary' : 'ghost'} 
                                className="w-full justify-start font-medium text-xs h-9"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2.5 text-muted-foreground" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* Category 1: Margins & Risk */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setMarginsExpanded(!marginsExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                Margins &amp; Risk
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${marginsExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        {marginsExpanded && (
                            <div className="mt-1 space-y-0.5 pl-1.5">
                                <Link href="/v3/margins/cm">
                                    <Button variant={url.startsWith('/v3/margins/cm') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0"></span>
                                        Margins (CM)
                                    </Button>
                                </Link>
                                <Link href="/v3/margins/egr">
                                    <Button variant={url.startsWith('/v3/margins/egr') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0"></span>
                                        Margins (EGR)
                                    </Button>
                                </Link>
                                <Link href="/v3/margins/fo">
                                    <Button variant={url.startsWith('/v3/margins/fo') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shrink-0"></span>
                                        Margins (FO)
                                    </Button>
                                </Link>
                                <Link href="/v3/margins/cd">
                                    <Button variant={url.startsWith('/v3/margins/cd') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
                                        Margins (CD)
                                    </Button>
                                </Link>
                                <Link href="/v3/margins/co">
                                    <Button variant={url.startsWith('/v3/margins/co') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 shrink-0"></span>
                                        Margins (CO)
                                    </Button>
                                </Link>
                                <Link href="/v3/margins/slb">
                                    <Button variant={url.startsWith('/v3/margins/slb') ? 'secondary' : 'ghost'} className="w-full justify-start text-xs h-8">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 shrink-0"></span>
                                        Margins (SLB)
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Category 2: Collaterals & Funds */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setCollateralExpanded(!collateralExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5 text-primary" />
                                Collaterals &amp; Funds
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collateralExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        {collateralExpanded && (
                            <div className="mt-1 space-y-0.5 pl-1.5">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Coins className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Collateral Management
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Margin &amp; Collateral Summary
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <CreditCard className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Cash Release Towards Pay-In
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Zap className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Early Pay-In (EPI)
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Limit and Enablement
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Category 3: Trading & Clearing */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setTradingExpanded(!tradingExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                                Trading &amp; Clearing
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${tradingExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        {tradingExpanded && (
                            <div className="mt-1 space-y-0.5 pl-1.5">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Users className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Online CP
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <FileCheck className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    CPC Confirmation
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Gavel className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Auction
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Ban className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Bid Cancellation
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <CheckSquare className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Exercise Request
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Unpaid MTF
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Tag className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Offer for Sale (OFS)
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <BarChart3 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    MFSS
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Category 4: Monitoring & Reports */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setReportsExpanded(!reportsExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-primary" />
                                Monitoring &amp; Reports
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${reportsExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        {reportsExpanded && (
                            <div className="mt-1 space-y-0.5 pl-1.5">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <FileCheck className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Client Margins / SA Reporting
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Gauge className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    CD Position Limit Monitoring
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Split className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Cross Margin
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <FolderDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Extranet
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Activity className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    IMS
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Category 5: Administration */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setAdminExpanded(!adminExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <UserCog className="w-3.5 h-3.5 text-primary" />
                                Administration
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        {adminExpanded && (
                            <div className="mt-1 space-y-0.5 pl-1.5">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <FolderArchive className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    File Management
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Users className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    FPI-Client Mapping
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <Receipt className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    TM Charges
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <UserCog className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    User Management
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                                    <BookOpen className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    User Manual
                                </Button>
                            </div>
                        )}
                    </div>
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
