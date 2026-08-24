import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function CmMargins({ data, segment }: { data: any[], segment: string }) {
    const [viewMode, setViewMode] = useState('total');

    return (
        <DashboardLayout header="RISK MANAGEMENT - CM">
            <Head title="CM Margins" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex gap-4 mb-4">
                    <select className="border border-slate-300 rounded px-4 py-2 bg-white text-slate-700">
                        <option>MARGINS</option>
                    </select>
                    <select className="border border-slate-300 rounded px-4 py-2 bg-white text-slate-700">
                        <option>COLLATERALS</option>
                    </select>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded">
                    <h2 className="text-[#800000] font-bold border-b pb-2 mb-4">TM MARGIN</h2>
                    
                    <div className="flex gap-6 mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="viewMode" checked={viewMode === 'total'} onChange={() => setViewMode('total')} className="text-indigo-600 focus:ring-indigo-500" />
                            Total Margins
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="viewMode" checked={viewMode === 'settlement'} onChange={() => setViewMode('settlement')} className="text-indigo-600 focus:ring-indigo-500" />
                            Settlement Level Margins
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="viewMode" checked={viewMode === 'security'} onChange={() => setViewMode('security')} className="text-indigo-600 focus:ring-indigo-500" />
                            Security Margins
                        </label>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-800">MARGIN SUMMARY (as of {new Date().toLocaleTimeString()})</h3>
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCcw className="w-4 h-4" /> Refresh
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-slate-300">
                            <thead className="bg-[#800000] text-white">
                                <tr>
                                    <th className="border border-slate-400 px-3 py-2">TM/CP Code</th>
                                    <th className="border border-slate-400 px-3 py-2">TM/CP Name</th>
                                    <th className="border border-slate-400 px-3 py-2">TM Cash (A)</th>
                                    <th className="border border-slate-400 px-3 py-2">TM Non-Cash (B)</th>
                                    <th className="border border-slate-400 px-3 py-2">TM/CP Effective Deposit</th>
                                    <th className="border border-slate-400 px-3 py-2">TM Prop/CP Margins (D)</th>
                                    <th className="border border-slate-400 px-3 py-2">Total Margins (H)</th>
                                    <th className="border border-slate-400 px-3 py-2">Utilisation %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.length > 0 ? data.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="border border-slate-300 px-3 py-2">{row.memCode}</td>
                                        <td className="border border-slate-300 px-3 py-2">Member</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right">{row.cashCollateral}</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right">{row.nonCashCollateral}</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right">{row.effectiveDeposit}</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right">{row.propMargin}</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right font-bold">{row.totalMargin}</td>
                                        <td className="border border-slate-300 px-3 py-2 text-right">{row.utilization}%</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center p-8 text-slate-500">No data available</td>
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
