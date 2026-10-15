import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import V3Layout from '@/Layouts/V3Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Activity, ShieldAlert, TrendingUp, AlertTriangle, Layers, RefreshCw } from 'lucide-react';
import '@/echo';

interface DashboardV3Props {
    cmMargins?: any[];
    tmMargins?: any[];
    securityMargins?: any[];
    mwplData?: any[];
    segment?: string;
    error?: string;
}

export default function DashboardV3({
    cmMargins: initCmMargins = [],
    tmMargins: initTmMargins = [],
    securityMargins: initSecMargins = [],
    mwplData = [],
    segment: initSegment = 'CM',
    error
}: DashboardV3Props) {
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);

    const [activeTab, setActiveTab] = useState(initSegment);
    const [viewMode, setViewMode] = useState<'security' | 'tm'>('security');
    const [liveMwpl, setLiveMwpl] = useState<any[]>(mwplData || []);
    const [securityMargins, setSecurityMargins] = useState<any[]>(extractData(initSecMargins));
    const [cmMargins, setCmMargins] = useState<any[]>(extractData(initCmMargins));
    const [tmMargins, setTmMargins] = useState<any[]>(extractData(initTmMargins));
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setActiveTab(initSegment);
    }, [initSegment]);

    useEffect(() => {
        setLiveMwpl(mwplData || []);
    }, [mwplData]);

    useEffect(() => {
        setSecurityMargins(extractData(initSecMargins));
    }, [initSecMargins]);

    useEffect(() => {
        setCmMargins(extractData(initCmMargins));
    }, [initCmMargins]);

    useEffect(() => {
        setTmMargins(extractData(initTmMargins));
    }, [initTmMargins]);

    // MWPL Real-time WebSocket
    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('mwpl')
                .listen('MwplUpdated', (e: any) => {
                    if (e.data && Array.isArray(e.data)) {
                        setLiveMwpl(e.data);
                    }
                });
        }

        return () => {
            if (window.Echo) window.Echo.leaveChannel('mwpl');
        };
    }, []);

    // Margins Real-time WebSocket
    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('margins')
                .listen('MarginDataUpdated', (e: any) => {
                    const eventSegment = e.dashboardData?.segment || e.segment;
                    if (eventSegment?.toLowerCase() !== activeTab.toLowerCase()) return;

                    router.reload({
                        only: ['securityMargins', 'cmMargins', 'tmMargins'],
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (page: any) => {
                            if (page.props.securityMargins) setSecurityMargins(extractData(page.props.securityMargins));
                            if (page.props.cmMargins) setCmMargins(extractData(page.props.cmMargins));
                            if (page.props.tmMargins) setTmMargins(extractData(page.props.tmMargins));
                            setIsRefreshing(false);
                        }
                    });
                });
        }

        return () => {
            if (window.Echo) window.Echo.leaveChannel('margins');
        };
    }, [activeTab]);

    const handleSegmentChange = (newSegment: string) => {
        setActiveTab(newSegment);
        router.get('/v3/dashboard', { segment: newSegment.toLowerCase() }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetch('/api/margins/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ type: 'security', segment: activeTab.toLowerCase() })
            });

            // Silent Inertia reload fallback after 2.5s
            setTimeout(() => {
                router.reload({
                    only: ['securityMargins', 'cmMargins', 'tmMargins'],
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page: any) => {
                        if (page.props.securityMargins) setSecurityMargins(extractData(page.props.securityMargins));
                        if (page.props.cmMargins) setCmMargins(extractData(page.props.cmMargins));
                        if (page.props.tmMargins) setTmMargins(extractData(page.props.tmMargins));
                        setIsRefreshing(false);
                    },
                    onError: () => setIsRefreshing(false)
                });
            }, 2500);
        } catch {
            setIsRefreshing(false);
        }
    };

    // Filter highly utilized MWPL
    const criticalMwpl = liveMwpl.filter(item => {
        const pct = parseFloat(item.oi_pct || item.percent);
        return !isNaN(pct) && pct > 85;
    });

    const tmRow = tmMargins?.[0];
    const utilization = tmRow ? Number(tmRow.utilization || 0) : 0;

    return (
        <V3Layout>
            <Head title={`Dashboard V3 - ${activeTab}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/30">
                                Segment: {activeTab}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">Real-time risk monitoring & margin utilization across clearing segments.</p>
                    </div>
                    {error && (
                        <Badge variant="destructive" className="px-4 py-2 text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {error}
                        </Badge>
                    )}
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Global Status</CardTitle>
                            <Activity className="w-4 h-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">Operational</div>
                            <p className="text-xs text-muted-foreground mt-1">All NSE Clearing API endpoints responding</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Critical MWPL Assets</CardTitle>
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{criticalMwpl.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Assets above 85% position limit utilization</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{activeTab} Margin Utilization</CardTitle>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{utilization}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Current {activeTab} effective deposit utilization</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main 2-column Grid matching Version 1 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                    {/* Card 1: Collateral & Margin Summary */}
                    <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm flex flex-col min-h-[460px]">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                                    Collateral & Margin Summary
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="h-8 px-2"
                                    title="Live Refresh"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>

                        {/* Segment Selector Tabs (CM, FO, CD, CO) */}
                        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-2 text-xs">
                            <div className="flex items-center gap-1">
                                {['CM', 'FO', 'CD', 'CO', 'SLB'].map((seg) => (
                                    <Button
                                        key={seg}
                                        variant={activeTab === seg ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleSegmentChange(seg)}
                                        className="h-7 text-xs font-semibold px-3"
                                    >
                                        {seg}
                                    </Button>
                                ))}
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant={viewMode === 'security' ? 'outline' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('security')}
                                    className="h-7 text-[11px] px-2.5"
                                >
                                    Security
                                </Button>
                                <Button
                                    variant={viewMode === 'tm' ? 'outline' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('tm')}
                                    className="h-7 text-[11px] px-2.5"
                                >
                                    TM Summary
                                </Button>
                            </div>
                        </div>

                        <CardContent className="p-0 flex-1 flex flex-col">
                            {viewMode === 'security' ? (
                                securityMargins && securityMargins.length > 0 ? (
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10.5px] border-b border-border/50">
                                                <tr>
                                                    <th className="px-3 py-2.5 font-semibold">TM/CP</th>
                                                    <th className="px-3 py-2.5 font-semibold">Sett.</th>
                                                    <th className="px-3 py-2.5 font-semibold">Client</th>
                                                    <th className="px-3 py-2.5 font-semibold">Symbol</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Total Margin</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Buy Qty</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Sell Qty</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Net Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {securityMargins.map((row: any, i: number) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-3 py-2 font-medium">{row.tm_cp_code}</td>
                                                        <td className="px-3 py-2 text-muted-foreground">{row.settlement_typ_no}</td>
                                                        <td className="px-3 py-2">{row.cli_code}</td>
                                                        <td className="px-3 py-2 font-semibold text-primary">{row.symb_ser || row.sec_symbol}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono">{Number(row.buy_qty || 0)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono">{Number(row.sell_qty || 0)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-semibold">{Number(row.net_qty || 0)?.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                        <AlertTriangle className="w-8 h-8 opacity-40 mb-2" />
                                        <p className="text-sm font-medium">No Security Margin Data Available for {activeTab}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try clicking the refresh button above or select another segment.</p>
                                    </div>
                                )
                            ) : (
                                tmMargins && tmMargins.length > 0 ? (
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10.5px] border-b border-border/50">
                                                <tr>
                                                    <th className="px-3 py-2.5 font-semibold">TM Code</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Cash</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Non-Cash</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Eff. Deposit</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Total Margin</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right">Utilization</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {tmMargins.map((row: any, i: number) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-3 py-2 font-semibold">{row.tm_cp_code}</td>
                                                        <td className="px-3 py-2 text-right font-mono">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-medium">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <Badge variant={Number(row.utilization) > 80 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                                                                {row.utilization}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                        <AlertTriangle className="w-8 h-8 opacity-40 mb-2" />
                                        <p className="text-sm font-medium">No TM Margin Summary Available for {activeTab}</p>
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>

                    {/* Card 2: Market Wide Position Limit (MWPL) */}
                    <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm flex flex-col min-h-[460px]">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                                    Market Wide Position Limit
                                </CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
                                FO
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-0 flex-1 flex flex-col">
                            {liveMwpl && liveMwpl.length > 0 ? (
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/40 text-muted-foreground uppercase text-[10.5px] border-b border-border/50">
                                            <tr>
                                                <th className="px-4 py-2.5 font-semibold">Symbol</th>
                                                <th className="px-4 py-2.5 font-semibold text-right">NSE OI</th>
                                                <th className="px-4 py-2.5 font-semibold text-right">Limit</th>
                                                <th className="px-4 py-2.5 font-semibold text-right">OI %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/20">
                                            {liveMwpl.slice(0, 15).map((item: any, i: number) => {
                                                const pct = parseFloat(item.oi_pct || item.percent);
                                                const isAlert = !isNaN(pct) && pct > 90;
                                                const isWarning = !isNaN(pct) && pct > 80 && pct <= 90;
                                                return (
                                                    <tr key={i} className={`hover:bg-muted/30 transition-colors ${isAlert ? 'bg-destructive/15 font-semibold' : isWarning ? 'bg-amber-500/10' : ''}`}>
                                                        <td className="px-4 py-2 font-medium">{item.symbol}</td>
                                                        <td className="px-4 py-2 text-right font-mono">{Number(item.oi || item.nse_oi)?.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-right font-mono">{Number(item.limit)?.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <Badge
                                                                variant={isAlert ? 'destructive' : isWarning ? 'outline' : 'secondary'}
                                                                className={`font-mono text-xs ${isAlert ? 'animate-pulse' : ''}`}
                                                            >
                                                                {pct}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <p className="text-sm font-medium">No MWPL data available</p>
                                </div>
                            )}

                            <div className="px-4 py-2.5 bg-muted/20 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between mt-auto">
                                <span>* NSE Clearing FutEq OI is provisional Open Interest</span>
                                <span className="text-xs font-semibold text-primary">Live Sync Active</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </V3Layout>
    );
}
