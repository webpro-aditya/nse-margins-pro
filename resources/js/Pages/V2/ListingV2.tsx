import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import V2Layout from '@/Layouts/V2Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { RefreshCcw, DownloadCloud, AlertTriangle, Layers, User } from 'lucide-react';
import ExportButtons from '@/Components/ExportButtons';
import '@/echo';

interface ListingV2Props {
    data?: any;
    tmMargins?: any;
    cmMargins?: any;
    cliMargins?: any;
    securityMargins?: any;
    settlementMargins?: any;
    segment: string;
    error?: string;
}

export default function ListingV2({
    data: initialData,
    tmMargins: initialTm = [],
    cmMargins: initialCm = [],
    cliMargins: initialCli = [],
    securityMargins: initialSec = [],
    settlementMargins: initialSet = [],
    segment,
    error
}: ListingV2Props) {
    const seg = (segment || 'cm').toLowerCase();

    // View modes for CM & FO
    const [cmView, setCmView] = useState<'total' | 'settlement' | 'security'>('total');
    const [foView, setFoView] = useState<'summary' | 'prop_breakup' | 'cli_margins'>('summary');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Safe extraction helper
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);

    const [tmData, setTmData] = useState<any[]>(extractData(initialTm));
    const [cmData, setCmData] = useState<any[]>(extractData(initialCm));
    const [cliData, setCliData] = useState<any[]>(extractData(initialCli));
    const [secData, setSecData] = useState<any[]>(extractData(initialSec));
    const [setData, setSetData] = useState<any[]>(extractData(initialSet));

    // Keep state in sync with props
    useEffect(() => {
        setTmData(extractData(initialTm));
    }, [initialTm]);

    useEffect(() => {
        setCmData(extractData(initialCm));
    }, [initialCm]);

    useEffect(() => {
        setCliData(extractData(initialCli));
    }, [initialCli]);

    useEffect(() => {
        setSecData(extractData(initialSec));
    }, [initialSec]);

    useEffect(() => {
        setSetData(extractData(initialSet));
    }, [initialSet]);

    // WebSocket Real-time listener matching default views
    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('margins')
                .listen('MarginDataUpdated', (e: any) => {
                    const eventSegment = e.dashboardData?.segment || e.segment;
                    if (eventSegment?.toLowerCase() !== seg) return;
                    
                    const eventType = e.dashboardData?.type || e.type;
                    const propsToReload = [];
                    if (eventType === 'tm') propsToReload.push('tmMargins');
                    if (eventType === 'cm') propsToReload.push('data', 'cmMargins');
                    if (eventType === 'cli') propsToReload.push('cliMargins');
                    if (eventType === 'security') propsToReload.push('securityMargins');
                    if (eventType === 'settlement') propsToReload.push('settlementMargins');
                    
                    if (propsToReload.length === 0) return;

                    router.reload({
                        only: propsToReload,
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: (page: any) => {
                            if (page.props.tmMargins) setTmData(extractData(page.props.tmMargins));
                            if (page.props.cmMargins) setCmData(extractData(page.props.cmMargins));
                            if (page.props.cliMargins) setCliData(extractData(page.props.cliMargins));
                            if (page.props.securityMargins) setSecData(extractData(page.props.securityMargins));
                            if (page.props.settlementMargins) setSetData(extractData(page.props.settlementMargins));
                            setIsRefreshing(false);
                        }
                    });
                });
        }

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('margins');
            }
        };
    }, [seg]);

    // Data fetching via async fetch API - avoids Inertia JSON response error
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            let refreshType = 'tm';
            if (seg === 'cm') {
                refreshType = cmView === 'total' ? 'cm' : cmView;
            } else if (seg === 'fo') {
                refreshType = foView === 'cli_margins' ? 'cli' : 'tm';
            } else if (seg === 'co') {
                refreshType = 'settlement';
            } else if (seg === 'cd') {
                refreshType = 'tm';
            }

            await fetch('/api/margins/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    type: refreshType,
                    segment: seg
                })
            });

            // Fallback partial reload just in case websockets fail (Version 1 workflow)
            setTimeout(() => {
                router.reload({ 
                    only: ['tmMargins', 'cmMargins', 'cliMargins', 'securityMargins', 'settlementMargins', 'data'], 
                    preserveScroll: true, 
                    preserveState: true 
                });
                setIsRefreshing(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to trigger refresh:', err);
            setIsRefreshing(false);
        }
    };

    // Bulk download trigger via async fetch
    const handleBulkDownload = async () => {
        try {
            let bulkType = 'cli-margins';
            if (seg === 'co') bulkType = 'settlement-margin';
            else if (seg === 'cm' && cmView === 'security') bulkType = 'security-margin';
            else if (seg === 'cm' && cmView === 'settlement') bulkType = 'settlement-margin';

            const res = await fetch('/api/margins/bulk-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    type: bulkType,
                    segment: seg
                })
            });
            const result = await res.json();
            alert(result.message || 'Bulk generation job dispatched successfully.');
        } catch (err) {
            console.error('Bulk generate failed:', err);
            alert('Failed to dispatch bulk export.');
        }
    };

    // Member information
    const memberCode = tmData?.[0]?.tm_cp_code || cmData?.[0]?.mem_code || setData?.[0]?.tm_cp_code || '90377';
    const memberName = tmData?.[0]?.tm_cp_name || cmData?.[0]?.mem_name || 'Trading Member';

    // Pagination helper
    const renderPagination = (paginator: any) => {
        if (!paginator || !paginator.links || paginator.links.length <= 3) return null;
        return (
            <div className="flex flex-wrap items-center justify-end gap-1 p-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground mr-4">
                    Showing {paginator.from || 0} to {paginator.to || 0} of {paginator.total || 0} results
                </div>
                {paginator.links.map((link: any, index: number) => {
                    const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                    return (
                        <button
                            key={index}
                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                            disabled={!link.url}
                            className={`px-3 py-1.5 text-xs rounded transition-colors ${
                                link.active 
                                    ? 'bg-primary text-primary-foreground font-semibold' 
                                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                            } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>
        );
    };

    // Export Data formatting based on active segment & view mode
    const getExportData = () => {
        if (seg === 'cm') {
            if (cmView === 'total') {
                const headers = ['TM CODE', 'TM NAME', 'TM CASH (A)', 'TM NON-CASH (B)', 'TM/CP EFFECTIVE DEPOSIT (C)', 'TM PROP / CP MARGINS (D)', 'CLI MARGINS > 90% (E)', 'NON-CASH BEN TM (F)', 'NON-CASH BEN CM (G)', 'TOTAL MARGINS (H)', 'UTILISATION %', 'APPROX. AVAILABLE MARGIN'];
                const rows = (tmData || []).map(row => [
                    row.tm_cp_code || '',
                    row.tm_cp_name || '',
                    row.cash_collateral ?? 0,
                    row.non_cash_collateral ?? 0,
                    row.effective_deposit ?? 0,
                    row.prop_margin ?? 0,
                    row.cli_margin ?? 0,
                    row.non_cash_ben_tm ?? 0,
                    row.non_cash_ben_cm ?? 0,
                    row.total_margin ?? 0,
                    `${row.utilization ?? 0}%`,
                    (row.effective_deposit || 0) - (row.total_margin || 0)
                ]);
                return { headers, rows };
            } else if (cmView === 'settlement') {
                const headers = ['TM CODE', 'CLIENT CODE', 'SETTLEMENT NO.', 'UPFRONT MARGIN', 'ICMTM', 'MTM LOSS', 'TOTAL MARGINS'];
                const rows = (setData || []).map(row => [
                    row.tm_cp_code || '',
                    row.cli_code || '',
                    row.settlement_typ_no || '',
                    row.upfront_margin ?? 0,
                    row.icmtm ?? 0,
                    row.mtm_loss ?? 0,
                    row.total_margins ?? 0,
                ]);
                return { headers, rows };
            } else {
                const headers = ['TM CODE', 'CLIENT CODE', 'SECURITY SYMBOL', 'SERIES', 'EXPIRY DATE', 'STRIKE PRICE', 'OPTION TYPE', 'QUANTITY', 'TOTAL MARGIN'];
                const rows = (secData || []).map(row => [
                    row.tm_cp_code || '',
                    row.cli_code || '',
                    row.sec_symbol || '',
                    row.series || '',
                    row.expiry_date || '',
                    row.strike_price ?? 0,
                    row.opt_type || '',
                    row.qty ?? 0,
                    row.total_margin ?? 0,
                ]);
                return { headers, rows };
            }
        } else if (seg === 'fo') {
            if (foView === 'summary') {
                const headers = ['CASH COLLATERAL', 'NON-CASH COLLATERAL', 'EFFECTIVE DEPOSIT', 'TOTAL MARGIN', 'TM MARGIN >90%', 'CLIENT MARGIN >90%', 'NON-CASH BEN TM', 'NON-CASH BEN CM', 'UTILISATION %'];
                const rows = (tmData || []).map(row => [
                    row.cash_collateral ?? 0,
                    row.non_cash_collateral ?? 0,
                    row.effective_deposit ?? 0,
                    row.total_margin ?? 0,
                    row.tm_cp_margin ?? 0,
                    row.cli_margin ?? 0,
                    row.non_cash_ben_tm ?? 0,
                    row.non_cash_ben_cm ?? 0,
                    `${row.utilization ?? 0}%`
                ]);
                return { headers, rows };
            } else if (foView === 'prop_breakup') {
                const headers = ['TOTAL PROP MARGIN', 'INITIAL MARGIN', 'COBG', 'DELIVERY / ADD. MARGIN', 'EXTREME LOSS MARGIN', 'IUMTM'];
                const rows = (tmData || []).map(row => [
                    row.prop_margin ?? 0,
                    row.ini_margin ?? 0,
                    row.cobg ?? 0,
                    row.delivery_margin ?? 0,
                    row.extrme_loss_margin ?? 0,
                    row.iumtm ?? 0
                ]);
                return { headers, rows };
            } else {
                const headers = ['CLIENT CODE', 'CASH COLLATERAL', 'NON-CASH COLLATERAL', 'TOTAL MARGIN', 'MTM P/L', 'EXCESS MARGINS', 'EXCESS NON-CASH', 'ELIGIBLE NON-CASH'];
                const rows = (cliData || []).map(row => [
                    row.cli_code || '',
                    row.cash_collateral ?? 0,
                    row.non_cash_collateral ?? 0,
                    row.total_margin ?? 0,
                    row.mtm_loss ?? 0,
                    row.cli_excess_margins ?? 0,
                    row.cli_excess_noncash ?? 0,
                    row.eligible_non_cash ?? 0
                ]);
                return { headers, rows };
            }
        } else if (seg === 'cd') {
            const headers = ['TM/CP Code', 'Cash Collat.', 'Non-Cash Collat.', 'Effective Deposit', 'Prop Margin', 'Cli Margin', 'Total Margin', 'Utilization %', 'TM Margin', 'IUMTM', 'Ini Margin', 'COBG', 'Delivery Margin', 'Extr. Loss Margin'];
            const rows = (tmData || []).map(row => [
                row.tm_cp_code || '',
                row.cash_collateral ?? 0,
                row.non_cash_collateral ?? 0,
                row.effective_deposit ?? 0,
                row.prop_margin ?? 0,
                row.cli_margin ?? 0,
                row.total_margin ?? 0,
                `${row.utilization ?? 0}%`,
                row.tm_cp_margin ?? 0,
                row.iumtm ?? 0,
                row.ini_margin ?? 0,
                row.cobg ?? 0,
                row.delivery_margin ?? 0,
                row.extrme_loss_margin ?? 0,
            ]);
            return { headers, rows };
        } else {
            // CO Segment
            const headers = ['TM CODE', 'CLIENT CODE', 'SETTLEMENT NO.', 'UPFRONT MARGIN', 'ICMTM', 'MTM LOSS', 'TOTAL MARGINS'];
            const rows = (setData || []).map(row => [
                row.tm_cp_code || '',
                row.cli_code || '',
                row.settlement_typ_no || '',
                row.upfront_margin ?? 0,
                row.icmtm ?? 0,
                row.mtm_loss ?? 0,
                row.total_margins ?? 0,
            ]);
            return { headers, rows };
        }
    };

    return (
        <V2Layout>
            <Head title={`${segment.toUpperCase()} Margins (V2)`} />

            <div className="flex flex-col gap-6">
                
                {/* 1. Header & Actions Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {memberName} ({memberCode})
                                </h1>
                                <Badge variant="outline" className="text-xs px-2.5 py-0.5 uppercase bg-primary/10 text-primary border-primary/30">
                                    {segment.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                As-on: {new Date().toLocaleString()} &bull; Real-time Margin Risk System
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <ExportButtons 
                            getData={getExportData}
                            title={`${segment.toUpperCase()}_MARGINS`}
                            segment={segment}
                            memberCode={memberCode}
                        />
                        <Button 
                            variant="outline" 
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                            className="bg-background/50 backdrop-blur-sm shadow-xs"
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                            {isRefreshing ? 'Syncing...' : 'Live Sync'}
                        </Button>
                        <Button onClick={handleBulkDownload} className="shadow-xs">
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Bulk Export
                        </Button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* 2. Sub-View Mode Selectors for CM and FO */}
                {seg === 'cm' && (
                    <div className="flex gap-2 border-b border-border/50 pb-2">
                        <Button
                            variant={cmView === 'total' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setCmView('total')}
                            className="text-xs font-semibold"
                        >
                            Total Margins
                        </Button>
                        <Button
                            variant={cmView === 'settlement' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setCmView('settlement')}
                            className="text-xs font-semibold"
                        >
                            Settlement Level Margins
                        </Button>
                        <Button
                            variant={cmView === 'security' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setCmView('security')}
                            className="text-xs font-semibold"
                        >
                            Security Margins
                        </Button>
                    </div>
                )}

                {seg === 'fo' && (
                    <div className="flex gap-2 border-b border-border/50 pb-2">
                        <Button
                            variant={foView === 'summary' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFoView('summary')}
                            className="text-xs font-semibold"
                        >
                            Margin Summary
                        </Button>
                        <Button
                            variant={foView === 'prop_breakup' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFoView('prop_breakup')}
                            className="text-xs font-semibold"
                        >
                            Proprietary Margin Breakup
                        </Button>
                        <Button
                            variant={foView === 'cli_margins' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFoView('cli_margins')}
                            className="text-xs font-semibold"
                        >
                            Client Margins
                        </Button>
                    </div>
                )}

                {/* 3. Main Data Card */}
                <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50 py-3.5 px-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <Layers className="w-4 h-4 text-primary" />
                                <CardTitle className="text-base uppercase tracking-wide">
                                    {seg === 'cm' && (cmView === 'total' ? 'CM Margin Summary' : cmView === 'settlement' ? 'Settlement-Level Margins' : 'Security Margins')}
                                    {seg === 'fo' && (foView === 'summary' ? 'FO Margin Summary' : foView === 'prop_breakup' ? 'Proprietary Margin Breakup' : 'Client Margins')}
                                    {seg === 'cd' && 'CD Margin Summary'}
                                    {seg === 'co' && 'CO Settlement Margins Detail'}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        
                        {/* CM SEGMENT TABLES */}
                        {seg === 'cm' && (
                            <>
                                {cmView === 'total' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3">TM Code</th>
                                                    <th className="px-4 py-3">TM Name</th>
                                                    <th className="px-4 py-3 text-right">TM Cash (A)</th>
                                                    <th className="px-4 py-3 text-right">TM Non-Cash (B)</th>
                                                    <th className="px-4 py-3 text-right">Effective Deposit (C)</th>
                                                    <th className="px-4 py-3 text-right">Prop Margin (D)</th>
                                                    <th className="px-4 py-3 text-right">Cli Margins (E)</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Ben TM (F)</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Ben CM (G)</th>
                                                    <th className="px-4 py-3 text-right">Total Margins (H)</th>
                                                    <th className="px-4 py-3 text-right">Utilization %</th>
                                                    <th className="px-4 py-3 text-right">Approx Available</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {tmData && tmData.length > 0 ? tmData.map((row, i) => {
                                                    const approxAvailable = (row.effective_deposit || 0) - (row.total_margin || 0);
                                                    return (
                                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3 font-semibold">{row.tm_cp_code}</td>
                                                            <td className="px-4 py-3 text-muted-foreground">{row.tm_cp_name || '-'}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono font-medium">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.prop_margin)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.cli_margin)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_ben_tm)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_ben_cm)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-mono font-bold">
                                                                <Badge variant="outline" className="font-mono">{row.utilization}%</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-500">₹{Number(approxAvailable)?.toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr>
                                                        <td colSpan={12} className="text-center py-12 text-muted-foreground">No TM margin data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialTm)}
                                    </div>
                                )}

                                {cmView === 'settlement' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3">TM Code</th>
                                                    <th className="px-4 py-3">Client Code</th>
                                                    <th className="px-4 py-3">Settlement No.</th>
                                                    <th className="px-4 py-3 text-right">Upfront Margin</th>
                                                    <th className="px-4 py-3 text-right">ICMTM</th>
                                                    <th className="px-4 py-3 text-right">MTM Loss</th>
                                                    <th className="px-4 py-3 text-right">Total Margins</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {setData && setData.length > 0 ? setData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3 font-semibold">{row.tm_cp_code}</td>
                                                        <td className="px-4 py-3">{row.cli_code}</td>
                                                        <td className="px-4 py-3">{row.settlement_typ_no}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.upfront_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.icmtm)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-destructive">₹{Number(row.mtm_loss)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margins)?.toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">No settlement margin data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialSet)}
                                    </div>
                                )}

                                {cmView === 'security' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3">TM Code</th>
                                                    <th className="px-4 py-3">Client Code</th>
                                                    <th className="px-4 py-3">Security Symbol</th>
                                                    <th className="px-4 py-3">Series</th>
                                                    <th className="px-4 py-3">Expiry Date</th>
                                                    <th className="px-4 py-3 text-right">Strike Price</th>
                                                    <th className="px-4 py-3">Option Type</th>
                                                    <th className="px-4 py-3 text-right">Quantity</th>
                                                    <th className="px-4 py-3 text-right">Total Margin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {secData && secData.length > 0 ? secData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3 font-semibold">{row.tm_cp_code}</td>
                                                        <td className="px-4 py-3">{row.cli_code}</td>
                                                        <td className="px-4 py-3 font-bold text-primary">{row.sec_symbol}</td>
                                                        <td className="px-4 py-3">{row.series}</td>
                                                        <td className="px-4 py-3">{row.expiry_date}</td>
                                                        <td className="px-4 py-3 text-right font-mono">{row.strike_price}</td>
                                                        <td className="px-4 py-3">{row.opt_type}</td>
                                                        <td className="px-4 py-3 text-right font-mono">{row.qty}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={9} className="text-center py-12 text-muted-foreground">No security margin data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialSec)}
                                    </div>
                                )}
                            </>
                        )}

                        {/* FO SEGMENT TABLES */}
                        {seg === 'fo' && (
                            <>
                                {foView === 'summary' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-right">Cash Collat.</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Collat.</th>
                                                    <th className="px-4 py-3 text-right">Effective Deposit</th>
                                                    <th className="px-4 py-3 text-right">Total Margin</th>
                                                    <th className="px-4 py-3 text-right">TM Margin &gt;90%</th>
                                                    <th className="px-4 py-3 text-right">Client Margin &gt;90%</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Ben TM</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Ben CM</th>
                                                    <th className="px-4 py-3 text-right">Utilization %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {tmData && tmData.length > 0 ? tmData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-medium">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.tm_cp_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cli_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_ben_tm)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_ben_cm)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold">
                                                            <Badge variant="outline" className="font-mono">{row.utilization}%</Badge>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={9} className="text-center py-12 text-muted-foreground">No FO margin data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialTm)}
                                    </div>
                                )}

                                {foView === 'prop_breakup' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-right">Total Prop Margin</th>
                                                    <th className="px-4 py-3 text-right">Initial Margin</th>
                                                    <th className="px-4 py-3 text-right">COBG</th>
                                                    <th className="px-4 py-3 text-right">Delivery / Add. Margin</th>
                                                    <th className="px-4 py-3 text-right">Extreme Loss Margin</th>
                                                    <th className="px-4 py-3 text-right">IUMTM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {tmData && tmData.length > 0 ? tmData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.prop_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.ini_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cobg)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.delivery_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.extrme_loss_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-destructive">₹{Number(row.iumtm)?.toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-12 text-muted-foreground">No proprietary margin breakup data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialTm)}
                                    </div>
                                )}

                                {foView === 'cli_margins' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-3">Client Code</th>
                                                    <th className="px-4 py-3 text-right">Cash Collat.</th>
                                                    <th className="px-4 py-3 text-right">Non-Cash Collat.</th>
                                                    <th className="px-4 py-3 text-right">Total Margin</th>
                                                    <th className="px-4 py-3 text-right">MTM P/L</th>
                                                    <th className="px-4 py-3 text-right">Excess Margins</th>
                                                    <th className="px-4 py-3 text-right">Excess Non-Cash</th>
                                                    <th className="px-4 py-3 text-right">Eligible Non-Cash</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {cliData && cliData.length > 0 ? cliData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3 font-semibold">{row.cli_code}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-destructive">₹{Number(row.mtm_loss)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cli_excess_margins)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.cli_excess_noncash)?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono">₹{Number(row.eligible_non_cash)?.toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={8} className="text-center py-12 text-muted-foreground">No client margin data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {renderPagination(initialCli)}
                                    </div>
                                )}
                            </>
                        )}

                        {/* CD SEGMENT TABLE */}
                        {seg === 'cd' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                        <tr>
                                            <th className="px-3 py-3">TM/CP Code</th>
                                            <th className="px-3 py-3 text-right">Cash Collat.</th>
                                            <th className="px-3 py-3 text-right">Non-Cash Collat.</th>
                                            <th className="px-3 py-3 text-right">Effective Deposit</th>
                                            <th className="px-3 py-3 text-right">Prop Margin</th>
                                            <th className="px-3 py-3 text-right">Cli Margin</th>
                                            <th className="px-3 py-3 text-right">Total Margin</th>
                                            <th className="px-3 py-3 text-right">Utilization %</th>
                                            <th className="px-3 py-3 text-right">TM Margin</th>
                                            <th className="px-3 py-3 text-right">IUMTM</th>
                                            <th className="px-3 py-3 text-right">Ini Margin</th>
                                            <th className="px-3 py-3 text-right">COBG</th>
                                            <th className="px-3 py-3 text-right">Delivery Margin</th>
                                            <th className="px-3 py-3 text-right">Extr. Loss Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {tmData && tmData.length > 0 ? tmData.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-3 py-3 font-semibold">{row.tm_cp_code}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono font-medium">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.prop_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.cli_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono font-bold">
                                                    <Badge variant="outline" className="font-mono">{row.utilization}%</Badge>
                                                </td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.tm_cp_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono text-destructive">₹{Number(row.iumtm)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.ini_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.cobg)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.delivery_margin)?.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right font-mono">₹{Number(row.extrme_loss_margin)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={14} className="text-center py-12 text-muted-foreground">No CD margin data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {renderPagination(initialTm)}
                            </div>
                        )}

                        {/* CO SEGMENT TABLE */}
                        {seg === 'co' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3">TM Code</th>
                                            <th className="px-4 py-3">Client Code</th>
                                            <th className="px-4 py-3">Settlement No.</th>
                                            <th className="px-4 py-3 text-right">Upfront Margin</th>
                                            <th className="px-4 py-3 text-right">ICMTM</th>
                                            <th className="px-4 py-3 text-right">MTM Loss</th>
                                            <th className="px-4 py-3 text-right">Total Margins</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {setData && setData.length > 0 ? setData.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-semibold">{row.tm_cp_code}</td>
                                                <td className="px-4 py-3">{row.cli_code}</td>
                                                <td className="px-4 py-3">{row.settlement_typ_no}</td>
                                                <td className="px-4 py-3 text-right font-mono">₹{Number(row.upfront_margin)?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-mono">₹{Number(row.icmtm)?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-mono text-destructive">₹{Number(row.mtm_loss)?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-primary">₹{Number(row.total_margins)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-12 text-muted-foreground">No CO settlement margin data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {renderPagination(initialSet)}
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>
        </V2Layout>
    );
}
