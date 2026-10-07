import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { RefreshCcw, User } from 'lucide-react';
import ExportButtons from '@/Components/ExportButtons';
import '@/echo';

interface CmMarginsProps {
    data: any;
    tmMargins?: any;
    cmMargins?: any;
    cliMargins?: any;
    securityMargins?: any;
    settlementMargins?: any;
    segment: string;
}

export default function CmMargins({
    data: initialData,
    tmMargins: initialTm = [],
    cmMargins: initialCm = [],
    cliMargins: initialCli = [],
    securityMargins: initialSec = [],
    settlementMargins: initialSet = [],
    segment
}: CmMarginsProps) {
    const [viewMode, setViewMode] = useState<'total' | 'settlement' | 'security'>('total');

    // Safely extract the data array if the prop is a paginator object
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);

    const [tmData, setTmData] = useState<any[]>(extractData(initialTm).length > 0 ? extractData(initialTm) : extractData(initialData));
    const [secData, setSecData] = useState<any[]>(extractData(initialSec));
    const [setData, setSetData] = useState<any[]>(extractData(initialSet));
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sync state with props when pagination links are clicked and props change
    useEffect(() => {
        setTmData(extractData(initialTm).length > 0 ? extractData(initialTm) : extractData(initialData));
    }, [initialTm, initialData]);

    useEffect(() => {
        setSecData(extractData(initialSec));
    }, [initialSec]);

    useEffect(() => {
        setSetData(extractData(initialSet));
    }, [initialSet]);

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
                    // We received a lightweight notification that data updated
                    // Fetch the fresh data dynamically via Inertia partial reload
                    router.reload({
                        only: ['tmMargins', 'securityMargins', 'settlementMargins', 'cmMargins', 'data'],
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: (page: any) => {
                            if (page.props.tmMargins) setTmData(extractData(page.props.tmMargins));
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
    }, []);

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
                    type: viewMode === 'total' ? 'total' : viewMode,
                    segment: segment
                })
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 1500);
        }
    };

    const headerTmCode = tmData?.[0]?.tm_cp_code || tmData?.[0]?.mem_code || 'N/A';
    const headerTmName = tmData?.[0]?.tm_cp_name || 'Trading Member';

    const getExportData = () => {
        if (viewMode === 'total') {
            const headers = ['TM CODE', 'TM NAME', 'TM CASH', 'TM NON-CASH', 'TM/CP EFFECTIVE DEPOSIT', 'TM PROP / CP MARGINS', 'CLI MARGINS > 90%', 'NON-CASH BENEFIT FROM TM EXCESS CASH', 'NON-CASH BENEFIT FROM CM EXCESS COLLATERAL', 'TOTAL MARGINS', 'TM MARGIN UTILISATION', 'APPROX. AVAILABLE MARGIN'];
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
        } else if (viewMode === 'settlement') {
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
    };

    return (
        <DashboardLayout header="RISK MANAGEMENT - CM">
            <Head title="CM Margins" />

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
                                Segment: CM &nbsp;|&nbsp; As-on Date/Time: {new Date().toLocaleString()}
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
                            title={`CM ${viewMode.toUpperCase()} MARGINS`}
                            segment="CM"
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
                                <input type="radio" name="viewMode" checked={viewMode === 'settlement'} onChange={() => setViewMode('settlement')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                Settlement Level Margins
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                <input type="radio" name="viewMode" checked={viewMode === 'security'} onChange={() => setViewMode('security')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                Security Margins
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
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM CODE</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM NAME</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM CASH (A)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM NON-CASH (B)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM/CP EFFECTIVE DEPOSIT (C=A+MIN(A,B))</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM PROP / CP MARGINS (D)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">CLI MARGINS &gt; 90% (E)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH BENEFIT FROM TM EXCESS CASH (F)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">NON-CASH BENEFIT FROM CM EXCESS COLLATERAL (G)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TOTAL MARGINS (H=D+E-F-G)</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM MARGIN UTILISATION [H/C]</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold bg-[#600000]">APPROX. AVAILABLE MARGIN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tmData && tmData.length > 0 ? tmData.map((row, i) => {
                                        const approxAvailable = (row.effective_deposit || 0) - (row.total_margin || 0);
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 border-b border-slate-200">
                                                <td className="border border-slate-300 px-3 py-2 text-center">{row.tm_cp_code}</td>
                                                <td className="border border-slate-300 px-3 py-2">{row.tm_cp_name}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_collateral)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-semibold text-slate-800">₹{Number(row.effective_deposit)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.prop_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.cli_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_ben_tm)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.non_cash_ben_cm)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-bold text-indigo-700">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-bold">{row.utilization}%</td>
                                                <td className="border border-slate-300 px-3 py-2 text-right font-bold text-green-700 bg-green-50/30">₹{Number(approxAvailable)?.toLocaleString()}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={12} className="text-center p-8 text-slate-500 font-medium">No TM margin data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(initialTm)}
                    </div>

                    {/* 3. Settlement-Level Information (when viewMode is 'settlement') */}
                    {viewMode === 'settlement' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-bold text-slate-800 text-sm uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                SETTLEMENT-LEVEL INFORMATION
                            </h3>
                            <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-[#800000] text-white">
                                        <tr>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">TM CODE</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">SETTLEMENT TYPE & NUMBER</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">TOTAL SETTLEMENT-LEVEL MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">UPFRONT MARGIN</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">ICMTM</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">MTM LOSS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {setData && setData.length > 0 ? setData.map((row, i) => (
                                            <tr key={i} className="hover:bg-amber-50/30 border-b border-slate-200">
                                                <td className="border border-slate-300 px-4 py-2.5 text-center font-medium">{row.tm_cp_code}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-center font-bold text-slate-700">{row.settlement_typ_no}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-center font-bold text-indigo-700">₹{Number(row.total_margins)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-center">₹{Number(row.upfront_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-center">₹{Number(row.icmtm)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2.5 text-center text-red-600">₹{Number(row.mtm_loss)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center p-8 text-slate-500 font-medium">No settlement level margin data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(initialSet)}
                        </div>
                    )}

                    {/* 4. Security-Level Margin Details (when viewMode is 'security') */}
                    {viewMode === 'security' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-bold text-slate-800 text-sm uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                SECURITY-LEVEL MARGIN DETAILS
                            </h3>
                            <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-[#800000] text-white">
                                        <tr>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">TM CODE</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">SETTLEMENT TYPE & NO.</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-center font-semibold text-[11px] leading-tight">SYMBOL & SERIES</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-right font-semibold text-[11px] leading-tight">UPFRONT MARGINS</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-right font-semibold text-[11px] leading-tight">EPI QUANTITY</th>
                                            <th className="border border-slate-400 px-3 py-2.5 text-right font-semibold text-[11px] leading-tight">EPI FUNDS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {secData && secData.length > 0 ? secData.map((row, i) => (
                                            <tr key={i} className="hover:bg-emerald-50/30 border-b border-slate-200">
                                                <td className="border border-slate-300 px-4 py-2 text-center font-medium">{row.tm_cp_code}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-center">{row.settlement_typ_no}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-center font-bold text-slate-700 bg-slate-50">{row.symb_ser}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-bold text-indigo-700">₹{Number(row.total_margin)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">{Number(row.epi_qty)?.toLocaleString()}</td>
                                                <td className="border border-slate-300 px-4 py-2 text-right">₹{Number(row.epi_funds)?.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center p-8 text-slate-500 font-medium">No security margin data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(initialSec)}
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}

