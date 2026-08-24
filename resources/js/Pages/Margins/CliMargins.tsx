import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Search } from 'lucide-react';

export default function CliMargins({ segment }: { segment: string }) {
    return (
        <DashboardLayout header="Client Level Margins">
            <Head title="Client Margins" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded">
                    <h2 className="text-[#800000] font-bold border-b pb-2 mb-4 uppercase">Query Client Margins</h2>
                    
                    <div className="flex gap-4 items-end mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Client Code / Name</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                placeholder="Enter specific client code to fetch..." 
                            />
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-[42px]">
                            <Search className="w-4 h-4" /> Fetch
                        </Button>
                        <Button variant="outline" className="h-[42px]">
                            Clear All
                        </Button>
                    </div>
                    
                    <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded border border-blue-100 mb-6">
                        Note: Client level margins can be very large. Please search for specific clients, or use the "Bulk Generate" API option for the full report.
                    </p>

                    <div className="overflow-x-auto border rounded border-slate-300">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#0a192f] text-slate-300">
                                <tr>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold">TM Code</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold">Client Code</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">Cash Collateral</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">Non-Cash Collateral</th>
                                    <th className="border-r border-slate-600 px-4 py-3 font-semibold text-right">Trade Margin</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-slate-500 bg-slate-50">
                                        Enter a client code and click Fetch to view margins.
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
