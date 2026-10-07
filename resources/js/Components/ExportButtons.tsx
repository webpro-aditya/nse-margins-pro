import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Download, Copy, Printer, FileText, Check } from 'lucide-react';
import { downloadCsv, downloadTxt, copyToClipboard, extractTableData } from '@/lib/exportUtils';

export interface ExportButtonsProps {
    tableRef?: React.RefObject<HTMLTableElement | null>;
    getData?: () => { headers: string[]; rows: (string | number)[][] };
    title?: string;
    segment?: string;
    memberCode?: string;
    filenamePrefix?: string;
    className?: string;
}

export default function ExportButtons({
    tableRef,
    getData,
    title = 'MARGINS DETAIL',
    segment = '',
    memberCode = '90377',
    filenamePrefix,
    className = 'flex gap-2'
}: ExportButtonsProps) {
    const [copied, setCopied] = useState(false);

    const resolveData = () => {
        if (getData) {
            const explicit = getData();
            if (explicit && explicit.headers.length > 0 && explicit.rows.length > 0) {
                return explicit;
            }
        }
        if (tableRef?.current) {
            const tableData = extractTableData(tableRef.current);
            if (tableData.rows.length > 0) {
                return tableData;
            }
        }
        // Fallback: search document for visible table
        const table = document.querySelector('table');
        if (table) {
            return extractTableData(table as HTMLTableElement);
        }
        return { headers: [], rows: [] };
    };

    const getBaseFilename = (ext: string) => {
        const seg = segment ? `${segment.toUpperCase()}_` : '';
        const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const prefix = filenamePrefix || `${seg}${cleanTitle}`;
        const dateStr = new Date().toISOString().slice(0, 10);
        return `${prefix}_${dateStr}.${ext}`;
    };

    const handleTxt = () => {
        const { headers, rows } = resolveData();
        if (rows.length === 0) {
            alert('No data available to export.');
            return;
        }
        downloadTxt({
            filename: getBaseFilename('txt'),
            title,
            segment,
            memberCode,
            headers,
            rows
        });
    };

    const handleDownload = () => {
        const { headers, rows } = resolveData();
        if (rows.length === 0) {
            alert('No data available to export.');
            return;
        }
        downloadCsv({
            filename: getBaseFilename('csv'),
            title,
            segment,
            memberCode,
            headers,
            rows
        });
    };

    const handleCopy = async () => {
        const { headers, rows } = resolveData();
        if (rows.length === 0) {
            alert('No data available to copy.');
            return;
        }
        await copyToClipboard({ headers, rows });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={className}>
            <Button 
                size="sm" 
                className="gap-1.5 text-xs h-8 bg-[#111827] text-white hover:bg-[#374151] transition-all active:scale-95 shadow-sm cursor-pointer"
                onClick={handleTxt}
                title="Export as Plain Text (.txt)"
            >
                <FileText className="w-3.5 h-3.5 text-slate-300" /> TXT
            </Button>

            <Button 
                size="sm" 
                className="gap-1.5 text-xs h-8 bg-[#111827] text-white hover:bg-[#374151] transition-all active:scale-95 shadow-sm cursor-pointer"
                onClick={handleDownload}
                title="Download as CSV (.csv)"
            >
                <Download className="w-3.5 h-3.5 text-slate-300" /> Download
            </Button>

            <Button 
                size="sm" 
                className={`gap-1.5 text-xs h-8 text-white transition-all active:scale-95 shadow-sm cursor-pointer ${
                    copied 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-[#111827] hover:bg-[#374151]'
                }`}
                onClick={handleCopy}
                title="Copy table data to clipboard"
            >
                {copied ? (
                    <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" /> Copied!
                    </>
                ) : (
                    <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" /> Copy
                    </>
                )}
            </Button>

            <Button 
                size="sm" 
                className="gap-1.5 text-xs h-8 bg-[#111827] text-white hover:bg-[#374151] transition-all active:scale-95 shadow-sm cursor-pointer"
                onClick={handlePrint}
                title="Print Report"
            >
                <Printer className="w-3.5 h-3.5 text-slate-300" /> Print
            </Button>
        </div>
    );
}
