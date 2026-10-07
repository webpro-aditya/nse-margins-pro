import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import V3Layout from '@/Layouts/V3Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { RefreshCcw, Download, DownloadCloud, AlertTriangle, Layers } from 'lucide-react';
import '@/echo';

interface ListingV3Props {
    data: any[];
    tmMargins: any[];
    cmMargins: any[];
    cliMargins: any[];
    securityMargins: any[];
    settlementMargins: any[];
    segment: string;
    error?: string;
}

export default function ListingV3({ 
    data: initialData, 
    tmMargins, 
    cmMargins, 
    segment, 
    error 
}: ListingV3Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);
    const [realtimeData, setRealtimeData] = useState<any[]>(extractData(initialData).length ? extractData(initialData) : extractData(cmMargins));

    useEffect(() => {
        setRealtimeData(extractData(initialData).length ? extractData(initialData) : extractData(cmMargins));
    }, [initialData, cmMargins]);

    useEffect(() => {
        window.Echo.private('margins')
            .listen('MarginDataUpdated', (e: any) => {
                if (e.segment === segment && e.type === 'cm') {
                    setRealtimeData(e.data);
                    setIsRefreshing(false);
                }
            });

        return () => {
            window.Echo.leave('margins');
        };
    }, [segment]);

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
                body: JSON.stringify({
                    type: 'total',
                    segment: segment
                })
            });
            setTimeout(() => {
                router.reload({ preserveScroll: true, preserveState: true });
                setIsRefreshing(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to trigger refresh:', err);
            setIsRefreshing(false);
        }
    };

    const handleBulkDownload = async () => {
        try {
            const res = await fetch('/api/margins/bulk-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    type: 'cli-margins',
                    segment: segment
                })
            });
            const data = await res.json();
            alert(data.message || 'Bulk generation started.');
        } catch (err) {
            console.error('Bulk generate failed:', err);
        }
    };

    return (
        <V3Layout>
            <Head title={`${segment.toUpperCase()} Margins`} />
            
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
                            <Badge variant="outline" className="text-sm px-2 uppercase bg-primary/10 text-primary border-primary/20">
                                Segment: {segment}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">Clearing Member (CM) margin summary.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                            className="bg-background/50 backdrop-blur-sm"
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Syncing...' : 'Live Sync'}
                        </Button>
                        <Button onClick={handleBulkDownload} className="shadow-sm">
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Bulk Export
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                <CardTitle className="text-lg">Margin Summary</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {realtimeData.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-8 h-8 opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No Margin Data</h3>
                                <p className="max-w-md mx-auto mt-2 text-sm">
                                    There is currently no margin data available for this segment. Try initiating a live sync.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-medium border-b border-border/50">CM Code</th>
                                            <th className="px-6 py-4 font-medium border-b border-border/50">CM Name</th>
                                            <th className="px-6 py-4 font-medium border-b border-border/50 text-right">CM Cash</th>
                                            <th className="px-6 py-4 font-medium border-b border-border/50 text-right">CM Non-Cash</th>
                                            <th className="px-6 py-4 font-medium border-b border-border/50 text-right">Total Margins</th>
                                            <th className="px-6 py-4 font-medium border-b border-border/50 text-right">Utilization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {realtimeData.map((item, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground">{item.mem_code || item.tm_code}</td>
                                                <td className="px-6 py-4">{item.mem_name || item.tm_name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.cm_cash || item.tm_cash || '-'}</td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.cm_non_cash || item.tm_non_cash || '-'}</td>
                                                <td className="px-6 py-4 text-right font-mono font-medium">{item.total_margins || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {item.cm_margin_utilization || item.tm_margin_utilization || '-'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
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
