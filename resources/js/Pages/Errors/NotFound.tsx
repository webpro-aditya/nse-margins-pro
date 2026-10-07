import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import V2Layout from '@/Layouts/V2Layout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Compass,
    ArrowLeft,
    LayoutDashboard,
    TrendingUp,
    Coins,
    BarChart3,
    Layers,
    Search,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';

interface NotFoundProps {
    status?: number;
    message?: string;
    url?: string;
}

export default function NotFound({ status = 404, message, url: propUrl }: NotFoundProps) {
    const page = usePage();
    const currentUrl = propUrl || page?.url || (typeof window !== 'undefined' ? window.location.pathname : '');

    const segments = [
        {
            name: 'CM Margins',
            desc: 'Capital Market upfront, settlement & security margins',
            href: '/v2/margins/cm',
            icon: BarChart3,
            badge: 'Cash Segment',
            color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
        },
        {
            name: 'FO Margins',
            desc: 'Futures & Options proprietary & client margin summary',
            href: '/v2/margins/fo',
            icon: TrendingUp,
            badge: 'Derivatives',
            color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
        },
        {
            name: 'CD Margins',
            desc: 'Currency Derivatives margins, utilization & exposure',
            href: '/v2/margins/cd',
            icon: Coins,
            badge: 'Currency',
            color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30'
        },
        {
            name: 'CO Margins',
            desc: 'Commodity segment settlement & upfront margin details',
            href: '/v2/margins/co',
            icon: Layers,
            badge: 'Commodities',
            color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
        },
    ];

    return (
        <V2Layout>
            <Head title="404 - Page Not Found" />

            <div className="relative min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center py-6 px-4">
                {/* Ambient Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="w-full max-w-3xl text-center space-y-8">
                    {/* Glowing 404 Number & Icon Badge */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="text-8xl sm:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/70 to-muted-foreground/30 select-none">
                                {status}
                            </div>
                            <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-background/80 border border-primary/40 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-primary shadow-lg shadow-primary/10 flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                                Page Not Found
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-4">
                            Lost in Margin Orbit?
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                            {message || 'The page or margin report you are trying to reach does not exist or may have been relocated.'}
                        </p>

                        {/* Attempted URL Indicator */}
                        {currentUrl && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-muted-foreground">
                                <span className="text-destructive font-semibold">404</span>
                                <span className="opacity-60">|</span>
                                <span className="truncate max-w-xs sm:max-w-md">{currentUrl}</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Primary Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/v2/dashboard'}
                            variant="outline"
                            className="bg-background/60 hover:bg-muted border-border/60"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Link href="/v2/dashboard">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Return to V2 Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* Available Segments Quick Nav */}
                    <div className="pt-6 border-t border-border/40">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Explore Active Segments
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                            {segments.map((seg) => {
                                const Icon = seg.icon;
                                return (
                                    <Link
                                        key={seg.name}
                                        href={seg.href}
                                        className="group block p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-md hover:bg-card/70 hover:border-primary/40 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {seg.name}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        {seg.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase border-border/60 text-muted-foreground">
                                                {seg.badge}
                                            </Badge>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </V2Layout>
    );
}
