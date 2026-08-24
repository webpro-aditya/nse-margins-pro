import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

export default function SettlementMargin({ segment }: { segment: string }) {
    return (
        <DashboardLayout header="Settlement Margins">
            <Head title="Settlement Margin" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded">
                    <h2 className="text-[#800000] font-bold border-b pb-2 mb-4 uppercase">Settlement Margins Detail</h2>

                    <div className="overflow-x-auto border rounded border-slate-300">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#0a192f] text-slate-300">
                                <tr>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold">TM Code</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold">Client Code</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold">Settlement No.</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">Upfront Margin</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">ICMTM</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">MTM Loss</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total Margins</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7} className="text-center p-12 text-slate-500 bg-slate-50">
                                        Data will be populated after daily processing.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
