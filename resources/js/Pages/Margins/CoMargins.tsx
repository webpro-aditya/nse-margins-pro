import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { RefreshCcw, User } from 'lucide-react';
import ExportButtons from '@/Components/ExportButtons';
import '@/echo';

interface CoMarginsProps {
    data: any;
    tmMargins?: any;
    cmMargins?: any;
    cliMargins?: any;
    securityMargins?: any;
    settlementMargins?: any;
    segment: string;
}

export default function CoMargins({
    data: initialData,
    tmMargins: initialTm = [],
    cmMargins: initialCm = [],
    cliMargins: initialCli = [],
    securityMargins: initialSec = [],
    settlementMargins: initialSet = [],
    segment
}: CoMarginsProps) {
    const [viewMode, setViewMode] = useState<'total' | 'prop_breakup' | 'cli_margins'>('total');
    
    // Safely extract the data array if the prop is a paginator object
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);
    
    const [tmData, setTmData] = useState<any[]>(extractData(initialTm).length > 0 ? extractData(initialTm) : extractData(initialData));
    const [cliData, setCliData] = useState<any[]>(extractData(initialCli));
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sync state with props when pagination links are clicked and props change
    useEffect(() => {
        setTmData(extractData(initialTm).length > 0 ? extractData(initialTm) : extractData(initialData));
    }, [initialTm, initialData]);

    useEffect(() => {
        setCliData(extractData(initialCli));
    }, [initialCli]);

    const renderPagination = (paginator: any) => {
        if (!paginator || !paginator.links || paginator.links.length <= 3) return null;
        return (
            <div className="flex flex-wrap items-center justify-end gap-1 mt-3 pb-2">
                <div className="text-xs text-slate-500 mr-4">
                    Showing {paginator.from || 0} to {paginator.to || 0} of {paginator.total || 0} results
                </div>
                {paginator.links.map((link: any, index: number) => {
                    const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                    return (
                        <button
                            key={index}
                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                            disabled={!link.url}
                            className={`px-3 py-1.5 text-xs border rounded transition-colors ${link.active ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('margins')
                .listen('MarginDataUpdated', (e: any) => {
                    console.log('ECHO RECEIVED:', e);
                    if ((e.dashboardData?.segment || e.segment) !== segment) return;
                    router.reload({ 
                        only: ['tmMargins', 'cliMargins', 'data'], 
                        preserveScroll: true, 
                        preserveState: true,
                        onSuccess: (page: any) => {
                            if (page.props.tmMargins) setTmData(extractData(page.props.tmMargins));
                            if (page.props.cliMargins) setCliData(extractData(page.props.cliMargins));
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
                    type: viewMode === 'cli_margins' ? 'cli' : 'tm',
                    segment: segment
                })
            });
            // Let the Echo listener handle the UI refresh when the data is ready!
            // But as a fallback if WS fails, do a soft reload after a delay
            setTimeout(() => {
                if (isRefreshing) {
                    router.reload({ only: ['tmMargins', 'cliMargins', 'data'], preserveScroll: true, preserveState: true });
                    setIsRefreshing(false);
                }
            }, 6000);
        } catch (error) {
            console.error('Failed to refresh data:', error);
            setIsRefreshing(false);
        }
    };

    const headerTmCode = tmData?.[0]?.tm_cp_code || 'N/A';
    const headerTmName = tmData?.[0]?.tm_cp_name || 'Trading Member';

    const getExportData = () => {
        if (viewMode === 'total') {
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
        } else if (viewMode === 'prop_breakup') {
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
    };

    return (
        <DashboardLayout header="RISK MANAGEMENT - CO">
            <Head title="CO Margins" />

            <div className="p-6 max-w-[1500px] mx-auto space-y-6">
                
                {/* 1. Member / Header Information */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                {headerTmName} ({headerTmCode})
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                Segment: {segment.toUpperCase()} &nbsp;|&nbsp; As-on Date/Time: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4 sm:mt-0">
                        <div className="flex gap-4">
                            <select className="border border-slate-300 rounded px-4 py-1.5 bg-white text-xs font-bold text-slate-700">
                                <option>MARGINS</option>
                            </select>
                            <select className="border border-slate-300 rounded px-4 py-1.5 bg-white text-slate-700 text-xs font-bold">
                                <option>COLLATERALS</option>
                            </select>
                        </div>
                        <ExportButtons 
                            getData={getExportData}
                            title={`CO ${viewMode.toUpperCase()} MARGINS`}
                            segment="CO"
                            memberCode={headerTmCode}
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-5 rounded space-y-6">
                    
                    {/* View Modes Selection */}
                    <div className="border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-6 text-sm font-semibold text-slate-700">
                            <span className="text-slate-500 uppercase text-xs tracking-wider">Margin Type / View:</span>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                <input type="radio" name="viewMode" checked={viewMode === 'total'} onChange={() => setViewMode('total')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                Total Margins
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                <input type="radio" name="viewMode" checked={viewMode === 'prop_breakup'} onChange={() => setViewMode('prop_breakup')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                Proprietary Margin Breakup
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                <input type="radio" name="viewMode" checked={viewMode === 'cli_margins'} onChange={() => setViewMode('cli_margins')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                Client Margins
                            </label>
                        </div>
                    </div>

                    {/* 2. Margin Summary (Always shown or shown on 'total') */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                MARGIN SUMMARY
                            </h3>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 bg-slate-50 hover:bg-slate-800 hover:text-white transition-colors" onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                            </Button>
                        </div>

                        <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-[#800000] text-white">
                                    <tr>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">CASH COLLATERAL</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH COLLATERAL</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">EFFECTIVE DEPOSIT</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TOTAL MARGIN</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM MARGIN &gt;90%</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">CLIENT MARGIN &gt;90%</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH BEN TM</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH BEN CM</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">UTILISATION %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tmData && tmData.length > 0 ? tmData.map((row, i) => {
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 border-b border-slate-200">
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-semibold text-slate-800">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-bold text-indigo-700">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.tm_cp_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.cli_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_ben_tm)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_ben_cm)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-bold">{row.utilization}%</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={9} className="text-center p-8 text-slate-500 font-medium">No TM margin data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(initialTm)}
                    </div>

                    {/* 3. Proprietary Margin Breakup (when viewMode is 'prop_breakup') */}
                    {viewMode === 'prop_breakup' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-bold text-slate-800 text-sm uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                PROPRIETARY MARGIN BREAKUP
                            </h3>
                            <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-[#800000] text-white">
                                        <tr>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">TOTAL PROP MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">INITIAL MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">COBG</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">DELIVERY / ADD. MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">EXTREME LOSS MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">IUMTM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tmData && tmData.length > 0 ? tmData.map((row, i) => (
                                            <tr key={i} className="hover:bg-amber-50/30 border-b border-slate-200">
                                                <td className="border border-slate-300 px-4 py-2.5 text-right font-bold text-indigo-700">₹{Number(row.prop_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-right">₹{Number(row.ini_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-right">₹{Number(row.cobg)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-right">₹{Number(row.delivery_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-right">₹{Number(row.extrme_loss_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-right text-red-600">₹{Number(row.iumtm)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center p-8 text-slate-500 font-medium">No proprietary margin breakup data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(initialTm)}
                        </div>
                    )}

                    {/* 4. Client Margins */}
                    {viewMode === 'cli_margins' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-bold text-slate-800 text-sm uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                CLIENT MARGINS
                            </h3>
                            <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-[#800000] text-white">
                                        <tr>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">CLIENT CODE</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">CASH COLLATERAL</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH COLLATERAL</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">TOTAL MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">MTM P/L</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">EXCESS MARGINS</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">EXCESS NON-CASH</th>
                                            <th className="border border-slate-400 px-3 py-2 text-center text-[10px] leading-tight font-semibold">ELIGIBLE NON-CASH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cliData && cliData.length > 0 ? cliData.map((row, i) => (
                                            <tr key={i} className="hover:bg-emerald-50/30 border-b border-slate-200">
                                                <td className="border border-slate-300 px-4 py-2 font-bold">{row.cli_code}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-bold text-indigo-700">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right text-red-600">₹{Number(row.mtm_loss)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.cli_excess_margins)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.cli_excess_noncash)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.eligible_non_cash)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={8} className="text-center p-8 text-slate-500 font-medium">No client margin data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(initialCli)}
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
