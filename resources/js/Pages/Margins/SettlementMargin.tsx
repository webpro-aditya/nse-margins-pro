import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { RefreshCcw, User } from 'lucide-react';
import ExportButtons from '@/Components/ExportButtons';

interface SettlementMarginProps {
    data?: any;
    settlementMargins?: any;
    segment: string;
}

export default function SettlementMargin({ 
    settlementMargins: initialData, 
    segment 
}: SettlementMarginProps) {
    const tableRef = useRef<HTMLTableElement>(null);
    const extractData = (prop: any) => prop?.data ? prop.data : (Array.isArray(prop) ? prop : []);
    
    const [data, setData] = useState<any[]>(extractData(initialData));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setData(extractData(initialData));
    }, [initialData]);

    const getExportData = () => {
        const headers = ['TM CODE', 'CLIENT CODE', 'SETTLEMENT NO.', 'UPFRONT MARGIN', 'ICMTM', 'MTM LOSS', 'TOTAL MARGINS'];
        const rows = (data || []).map(row => [
            row.tm_cp_code || '',
            row.cli_code || '',
            row.settlement_typ_no || '',
            row.upfront_margin ?? 0,
            row.icmtm ?? 0,
            row.mtm_loss ?? 0,
            row.total_margins ?? 0,
        ]);
        return { headers, rows };
    };

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
                    if ((e.dashboardData?.segment || e.segment) !== segment) return;
                    router.reload({ 
                        only: ['settlementMargins'], 
                        preserveScroll: true, 
                        preserveState: true,
                        onSuccess: (page: any) => {
                            if (page.props.settlementMargins) setData(extractData(page.props.settlementMargins));
                            setIsRefreshing(false);
                            setError(null);
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
                    type: 'settlement',
                    segment: segment
                })
            });
            setTimeout(() => {
                if (isRefreshing) {
                    router.reload({ only: ['settlementMargins'], preserveScroll: true, preserveState: true });
                    setIsRefreshing(false);
                }
            }, 6000);
        } catch (error: any) {
            console.error('Failed to dispatch refresh job:', error);
            setError(error.message || 'Refresh failed');
            setIsRefreshing(false);
        }
    };

    const headerTmCode = data?.[0]?.tm_cp_code || 'N/A';
    const headerTmName = 'Trading Member';

    return (
        <DashboardLayout header={`RISK MANAGEMENT - ${segment.toUpperCase()}`}>
            <Head title={`${segment.toUpperCase()} Margin`} />

            <div className="p-6 max-w-[1500px] mx-auto space-y-6">
                
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                        <div>
                            <strong>API Refresh Failed:</strong> {error}
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
                            &times;
                        </button>
                    </div>
                )}

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
                            tableRef={tableRef}
                            getData={getExportData}
                            title={`${segment.toUpperCase()} MARGINS DETAIL`}
                            segment={segment}
                            memberCode={headerTmCode}
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-5 rounded space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {segment.toUpperCase()} MARGINS DETAIL
                            </h3>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 bg-slate-50 hover:bg-slate-800 hover:text-white transition-colors" onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                            </Button>
                        </div>

                        <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
                            <table ref={tableRef} className="w-full text-xs text-left border-collapse">
                                <thead className="bg-[#800000] text-white">
                                    <tr>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TM CODE</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">CLIENT CODE</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">SETTLEMENT NO.</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">UPFRONT MARGIN</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">ICMTM</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">MTM LOSS</th>
                                        <th className="border border-slate-400 px-2 py-2 text-center text-[10px] leading-tight font-semibold">TOTAL MARGINS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data && data.length > 0 ? data.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 border-b border-slate-200 transition-colors">
                                            <td className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-800">{row.tm_cp_code}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-center">{row.cli_code}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-center">{row.settlement_typ_no}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.upfront_margin)?.toLocaleString() ?? 0}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-right">₹{Number(row.icmtm)?.toLocaleString() ?? 0}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-right text-red-600">₹{Number(row.mtm_loss)?.toLocaleString() ?? 0}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-right font-bold text-indigo-700">₹{Number(row.total_margins)?.toLocaleString() ?? 0}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-slate-500 font-medium">
                                                No data available or will be populated after daily processing.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(initialData)}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
