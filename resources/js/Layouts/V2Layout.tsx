import { type PropsWithChildren } from 'react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { useFlashMessages } from '@/Hooks/useFlashMessages';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function V2Layout({ children }: PropsWithChildren) {
    useFlashMessages();
    const page = usePage();
    const url = page?.url || '';
    const props = page?.props || {};
    const { auth } = props as any;

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
                    <div className="flex items-center gap-6">
                        <Link href="/v2/dashboard" className="flex items-center gap-2">
                            <ApplicationLogo size="sm" />
                        </Link>
                        
                        <nav className="hidden md:flex items-center gap-1 ml-4">
                            <Link href="/v2/dashboard">
                                <Button 
                                    variant={url === '/v2/dashboard' ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/v2/margins/cm">
                                <Button 
                                    variant={url.startsWith('/v2/margins/cm') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    CM
                                </Button>
                            </Link>
                            <Link href="/v2/margins/fo">
                                <Button 
                                    variant={url.startsWith('/v2/margins/fo') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    FO
                                </Button>
                            </Link>
                            <Link href="/v2/margins/cd">
                                <Button 
                                    variant={url.startsWith('/v2/margins/cd') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    CD
                                </Button>
                            </Link>
                            <Link href="/v2/margins/co">
                                <Button 
                                    variant={url.startsWith('/v2/margins/co') ? 'secondary' : 'ghost'} 
                                    className="text-sm font-medium"
                                >
                                    CO
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
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
