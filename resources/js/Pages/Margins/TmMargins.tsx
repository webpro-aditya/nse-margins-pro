import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Download, Printer } from 'lucide-react';

export default function TmMargins({ data, segment }: { data: any[], segment: string }) {
    return (
        <DashboardLayout header="TM Detailed Margins">
            <Head title="TM Margins" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                <div className="flex justify-end gap-2 mb-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-slate-300">
                            <thead className="bg-[#800000] text-white">
                                <tr>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-center align-middle" rowSpan={2}>TM Code</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-center align-middle" rowSpan={2}>TM Name</th>
                                    <th className="border border-slate-400 px-4 py-2 font-semibold text-center" colSpan={4}>Margins Breakdown (Rs.)</th>
                                </tr>
                                <tr>
                                    <th className="border border-slate-400 px-4 py-2 font-semibold text-right">MTM Loss (A)</th>
                                    <th className="border border-slate-400 px-4 py-2 font-semibold text-right">Trade Margins (B)</th>
                                    <th className="border border-slate-400 px-4 py-2 font-semibold text-right">ICMTM (C)</th>
                                    <th className="border border-slate-400 px-4 py-2 font-semibold text-right">Total (A+B+C)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.length > 0 ? data.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="border border-slate-300 px-4 py-3 text-center">{row.tmCpCode}</td>
                                        <td className="border border-slate-300 px-4 py-3 font-medium">{row.tmCpName}</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right text-red-600">{Number(row.mtmLoss)?.toLocaleString()}</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right">{Number(row.tradeMargin)?.toLocaleString()}</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right">{Number(row.icmtm)?.toLocaleString()}</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">
                                            {Number(row.totalMargin)?.toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-slate-500">No TM margin data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
