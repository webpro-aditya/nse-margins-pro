import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import V3Layout from '@/Layouts/V3Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Activity, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import '@/echo'; // real-time updates

interface DashboardV3Props {
    cmMargins: any[];
    tmMargins: any[];
    securityMargins: any[];
    mwplData: any[];
    error?: string;
}

export default function DashboardV3({ mwplData, error }: DashboardV3Props) {
    const [realtimeMwpl, setRealtimeMwpl] = React.useState<any[]>(mwplData || []);

    useEffect(() => {
        setRealtimeMwpl(mwplData);
    }, [mwplData]);

    useEffect(() => {
        window.Echo.channel('mwpl')
            .listen('MwplUpdated', (e: any) => {
                if (e.data && Array.isArray(e.data)) {
                    setRealtimeMwpl(e.data);
                }
            });
        
        return () => {
            window.Echo.leaveChannel('mwpl');
        };
    }, []);

    // Filter highly utilized MWPL
    const criticalMwpl = realtimeMwpl.filter(item => {
        const pct = parseFloat(item.oi_pct);
        return !isNaN(pct) && pct > 85;
    });

    return (
        <V3Layout>
            <Head title="Dashboard V2" />
            
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                        <p className="text-muted-foreground mt-1">Real-time risk monitoring & margin utilization.</p>
                    </div>
                    {error && (
                        <Badge variant="destructive" className="px-4 py-2 text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {error}
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Global Status</CardTitle>
                            <Activity className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">Operational</div>
                            <p className="text-xs text-muted-foreground mt-1">All NSE API endpoints responding</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Critical MWPL Assets</CardTitle>
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{criticalMwpl.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Assets above 85% utilization</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Margin Updates</CardTitle>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Real-time</div>
                            <p className="text-xs text-muted-foreground mt-1">Connected via WebSocket</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm mt-4">
                    <CardHeader>
                        <CardTitle>Market Wide Position Limits (MWPL)</CardTitle>
                        <CardDescription>Live feed of securities approaching position limits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {realtimeMwpl.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                                No MWPL data available.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border border-border/50">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium border-b border-border/50">Symbol</th>
                                            <th className="px-4 py-3 font-medium border-b border-border/50 text-right">NSE OI</th>
                                            <th className="px-4 py-3 font-medium border-b border-border/50 text-right">Limit</th>
                                            <th className="px-4 py-3 font-medium border-b border-border/50 text-right">Utilization %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {realtimeMwpl.slice(0, 15).map((item, i) => {
                                            const pct = parseFloat(item.oi_pct);
                                            const isCritical = !isNaN(pct) && pct > 85;
                                            return (
                                                <tr key={i} className={`hover:bg-muted/30 transition-colors ${isCritical ? 'bg-destructive/10' : ''}`}>
                                                    <td className="px-4 py-3 font-medium">{item.symbol}</td>
                                                    <td className="px-4 py-3 text-right">{item.nse_oi?.toLocaleString() || '-'}</td>
                                                    <td className="px-4 py-3 text-right">{item.limit?.toLocaleString() || '-'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Badge variant={isCritical ? "destructive" : "secondary"} className={isCritical ? 'animate-pulse' : ''}>
                                                            {item.oi_pct}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </V3Layout>
    );
}
