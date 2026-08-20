import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { ROUTES } from '@/Constants/routes';
import type { PageProps } from '@/types';

interface WelcomeProps extends PageProps {
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({ laravelVersion, phpVersion, auth }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
                {/* Nav */}
                <header className="flex items-center justify-between px-6 py-4 lg:px-8">
                    <ApplicationLogo size="md" />
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={ROUTES.DASHBOARD}>
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href={ROUTES.LOGIN}>
                                    Sign in
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Hero */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <div className="max-w-2xl animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-6">
                            <Zap className="h-3.5 w-3.5" />
                            Built with Laravel {laravelVersion} &middot; PHP {phpVersion}
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                            NSE Margins
                            <span className="text-primary"> Pro</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                            Enterprise-grade margin analysis platform. Built with Laravel,
                            React, and Inertia.js for blazing-fast performance.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Button asChild size="lg">
                                <Link href={auth.user ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
                                    Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Feature pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl w-full animate-slide-up">
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4">
                            <Shield className="h-5 w-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Secure Auth</p>
                                <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4">
                            <Zap className="h-5 w-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Blazing Fast</p>
                                <p className="text-xs text-muted-foreground">SPA-like experience</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4">
                            <BarChart3 className="h-5 w-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Margin Analysis</p>
                                <p className="text-xs text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} NSE Margins Pro. All rights reserved.
                </footer>
            </div>
        </>
    );
}
