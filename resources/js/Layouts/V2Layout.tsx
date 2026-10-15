import { type PropsWithChildren, useState, useRef, useEffect } from 'react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { useFlashMessages } from '@/Hooks/useFlashMessages';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LogOut,
    ArrowRightLeft,
    ChevronDown,
    LayoutGrid,
    Menu,
    X,
    Layers,
    Coins,
    Users,
    Activity,
    UserCog,
    FileSpreadsheet,
    CreditCard,
    Zap,
    SlidersHorizontal,
    FileCheck,
    Gavel,
    Ban,
    CheckSquare,
    AlertTriangle,
    Tag,
    BarChart3,
    Gauge,
    Split,
    FolderDown,
    FolderArchive,
    Receipt,
    BookOpen
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function V2Layout({ children }: PropsWithChildren) {
    useFlashMessages();
    const page = usePage();
    const url = page?.url || '';
    const props = page?.props || {};
    const { auth } = props as any;

    const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const servicesMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target as Node)) {
                setServicesMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
            {/* Subtle background gradient from GuestLayout */}
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

            {/* Top Navigation */}
            <header className="relative z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <Link href="/v2/dashboard" className="flex items-center gap-2">
                            <ApplicationLogo size="sm" />
                        </Link>
                        
                        <nav className="hidden lg:flex items-center gap-1 ml-2">
                            <Link href="/v2/dashboard">
                                <Button 
                                    variant={url === '/v2/dashboard' ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                                    Dashboard
                                </Button>
                            </Link>

                            <Link href="/v2/margins/cm">
                                <Button 
                                    variant={url.startsWith('/v2/margins/cm') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    CM
                                </Button>
                            </Link>
                            <Link href="/v2/margins/egr">
                                <Button 
                                    variant={url.startsWith('/v2/margins/egr') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    EGR
                                </Button>
                            </Link>
                            <Link href="/v2/margins/fo">
                                <Button 
                                    variant={url.startsWith('/v2/margins/fo') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    FO
                                </Button>
                            </Link>
                            <Link href="/v2/margins/cd">
                                <Button 
                                    variant={url.startsWith('/v2/margins/cd') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    CD
                                </Button>
                            </Link>
                            <Link href="/v2/margins/co">
                                <Button 
                                    variant={url.startsWith('/v2/margins/co') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    CO
                                </Button>
                            </Link>
                            <Link href="/v2/margins/slb">
                                <Button 
                                    variant={url.startsWith('/v2/margins/slb') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium px-2.5"
                                >
                                    SLB
                                </Button>
                            </Link>

                            {/* Portal Services Mega-Menu Dropdown Button */}
                            <div className="relative ml-2" ref={servicesMenuRef}>
                                <Button 
                                    variant={servicesMenuOpen ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium flex items-center gap-1.5 border border-border/50"
                                    onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                                >
                                    <LayoutGrid className="w-4 h-4 text-primary" />
                                    <span>Services</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                                </Button>

                                {/* Dropdown Mega Menu Panel */}
                                {servicesMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-[820px] bg-popover/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-xl p-5 z-50 text-popover-foreground animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40">
                                            <div className="flex items-center gap-2">
                                                <LayoutGrid className="w-4 h-4 text-primary" />
                                                <span className="font-bold text-sm tracking-tight">NSE Clearing Portal Services</span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">25 Clearing Modules &amp; Risk Tools</span>
                                        </div>

                                        <div className="grid grid-cols-5 gap-4 text-xs">
                                            {/* Column 1: Margins */}
                                            <div className="space-y-1.5">
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1 pb-1 border-b border-border/30">
                                                    <Layers className="w-3.5 h-3.5" /> Margins
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <Link href="/v2/margins/cm" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        CM
                                                    </Link>
                                                    <Link href="/v2/margins/egr" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        EGR
                                                    </Link>
                                                    <Link href="/v2/margins/fo" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        FO
                                                    </Link>
                                                    <Link href="/v2/margins/cd" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        CD
                                                    </Link>
                                                    <Link href="/v2/margins/co" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                        CO
                                                    </Link>
                                                    <Link href="/v2/margins/slb" onClick={() => setServicesMenuOpen(false)} className="py-1 px-1.5 rounded hover:bg-accent transition-colors flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                        SLB
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Column 2: Collaterals & Funds */}
                                            <div className="space-y-1.5">
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1 pb-1 border-b border-border/30">
                                                    <Coins className="w-3.5 h-3.5" /> Collateral &amp; Funds
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Coins className="w-3 h-3 text-muted-foreground" />
                                                        Collateral Mgmt
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <FileSpreadsheet className="w-3 h-3 text-muted-foreground" />
                                                        Margin Summary
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <CreditCard className="w-3 h-3 text-muted-foreground" />
                                                        Cash Release
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3 text-muted-foreground" />
                                                        EPI
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
                                                        Limits
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column 3: Trading & Settlement */}
                                            <div className="space-y-1.5">
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1 pb-1 border-b border-border/30">
                                                    <ArrowRightLeft className="w-3.5 h-3.5" /> Clearing
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Users className="w-3 h-3 text-muted-foreground" />
                                                        Online CP
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <FileCheck className="w-3 h-3 text-muted-foreground" />
                                                        CPC
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Gavel className="w-3 h-3 text-muted-foreground" />
                                                        Auction
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Ban className="w-3 h-3 text-muted-foreground" />
                                                        Bid Cancellation
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <CheckSquare className="w-3 h-3 text-muted-foreground" />
                                                        Exercise Request
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                                                        Unpaid MTF
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                                        OFS
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                                                        MFSS
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column 4: Monitoring & Reports */}
                                            <div className="space-y-1.5">
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1 pb-1 border-b border-border/30">
                                                    <Activity className="w-3.5 h-3.5" /> Risk &amp; Reports
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <FileCheck className="w-3 h-3 text-muted-foreground" />
                                                        Client Margins
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Gauge className="w-3 h-3 text-muted-foreground" />
                                                        Position Limits
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Split className="w-3 h-3 text-muted-foreground" />
                                                        Cross Margin
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <FolderDown className="w-3 h-3 text-muted-foreground" />
                                                        Extranet
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Activity className="w-3 h-3 text-muted-foreground" />
                                                        IMS
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column 5: Administration */}
                                            <div className="space-y-1.5">
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1 pb-1 border-b border-border/30">
                                                    <UserCog className="w-3.5 h-3.5" /> Admin &amp; Tools
                                                </div>
                                                <div className="flex flex-col space-y-0.5">
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <FolderArchive className="w-3 h-3 text-muted-foreground" />
                                                        File Mgmt
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Users className="w-3 h-3 text-muted-foreground" />
                                                        FPI-Client
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <Receipt className="w-3 h-3 text-muted-foreground" />
                                                        TM Charges
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <UserCog className="w-3 h-3 text-muted-foreground" />
                                                        User Mgmt
                                                    </span>
                                                    <span className="py-1 px-1.5 rounded hover:bg-accent cursor-pointer transition-colors flex items-center gap-1.5">
                                                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                                                        User Manual
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle Button */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>

                        {auth?.user ? (
                            <>
                                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                    {auth.user.name}
                                </span>
                                <ModeToggle />
                                <Link 
                                    href="/logout" 
                                    method="post" 
                                    as="button"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Link>
                            </>
                        ) : (
                            <>
                                <ModeToggle />
                                <Link 
                                    href="/login" 
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl p-4 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Link href="/v2/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="secondary" className="w-full justify-start text-xs">
                                    <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/v2/margins/cm" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (CM)
                                </Button>
                            </Link>
                            <Link href="/v2/margins/egr" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (EGR)
                                </Button>
                            </Link>
                            <Link href="/v2/margins/fo" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (FO)
                                </Button>
                            </Link>
                            <Link href="/v2/margins/cd" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (CD)
                                </Button>
                            </Link>
                            <Link href="/v2/margins/co" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (CO)
                                </Button>
                            </Link>
                            <Link href="/v2/margins/slb" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-xs">
                                    Margins (SLB)
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 container mx-auto px-4 py-8 animate-fade-in">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/40 py-6 text-center text-sm text-muted-foreground bg-background/40 backdrop-blur-sm">
                <p>© {new Date().getFullYear()} NSE Margins Pro (V2). All rights reserved.</p>
            </footer>

            <Toaster position="top-right" />
        </div>
    );
}
