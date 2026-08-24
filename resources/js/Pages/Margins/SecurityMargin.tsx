import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Download, Printer, Copy, FileText } from 'lucide-react';

export default function SecurityMargin({ segment }: { segment: string }) {
    return (
        <DashboardLayout header="Member Settlement Security Margins">
            <Head title="Security Margin" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded">ALL AMOUNTS IN RS.</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" title="Save as TXT">
                            <FileText className="w-4 h-4" /> TXT
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" /> Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Copy className="w-4 h-4" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-slate-300">
                            <thead className="bg-[#800000] text-white">
                                <tr>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-center">TM Code</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-center">Settlement Type & No.</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-center">Symbol & Series</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-right">Upfront Margins</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-right">EPI Quantity</th>
                                    <th className="border border-slate-400 px-4 py-3 font-semibold text-right">EPI Funds</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-slate-500 bg-slate-50">
                                        Data will be populated after daily processing.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <p className="text-xs text-slate-500 text-right mt-2 font-medium">
                    Report Generation Time: {new Date().toLocaleString('en-IN')}
                </p>
            </div>
        </DashboardLayout>
    );
}
