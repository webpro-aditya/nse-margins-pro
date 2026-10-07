/**
 * Export and Clipboard Utilities for NSE Margins Tables
 */

export interface ExportData {
    headers: string[];
    rows: (string | number)[][];
}

export interface ExportOptions {
    filename: string;
    headers: string[];
    rows: (string | number)[][];
    title?: string;
    segment?: string;
    memberCode?: string;
}

/**
 * Escapes a cell value for CSV format according to RFC 4180.
 */
function escapeCsvCell(cell: string | number | null | undefined): string {
    if (cell === null || cell === undefined) return '';
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Downloads data as a CSV file.
 * Includes UTF-8 BOM so Excel opens Indian currency and UTF-8 characters properly.
 */
export function downloadCsv({ filename, headers, rows }: ExportOptions): void {
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push(headers.map(escapeCsvCell).join(','));
    
    // Data rows
    for (const row of rows) {
        csvRows.push(row.map(escapeCsvCell).join(','));
    }

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Downloads data as a formatted TXT file.
 * Uses Tab-Separated Values with a clean NSE Clearing header.
 */
export function downloadTxt({ filename, headers, rows, title, segment, memberCode }: ExportOptions): void {
    const lines: string[] = [];
    const timestamp = new Date().toLocaleString();
    const border = '='.repeat(100);
    const subBorder = '-'.repeat(100);

    lines.push(border);
    lines.push(`NSE CLEARING - RISK MANAGEMENT SYSTEM`);
    if (title) lines.push(`REPORT: ${title.toUpperCase()}`);
    lines.push(`SEGMENT: ${(segment || 'N/A').toUpperCase()} | MEMBER: ${memberCode || '90377'} | AS-ON: ${timestamp}`);
    lines.push(border);
    lines.push(headers.join('\t'));
    lines.push(subBorder);

    for (const row of rows) {
        lines.push(row.map(val => (val === null || val === undefined ? '' : String(val))).join('\t'));
    }

    lines.push(subBorder);
    lines.push(`Total Records: ${rows.length}`);
    lines.push(border);

    const txtString = lines.join('\r\n');
    const blob = new Blob([txtString], { type: 'text/plain;charset=utf-8;' });
    triggerBlobDownload(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`);
}

/**
 * Copies headers and rows to clipboard as Tab-Separated Values (TSV).
 * This ensures that when the user pastes into Excel or Google Sheets,
 * it pastes directly into columns and rows.
 */
export async function copyToClipboard({ headers, rows }: { headers: string[]; rows: (string | number)[][] }): Promise<boolean> {
    const lines: string[] = [];
    lines.push(headers.join('\t'));
    for (const row of rows) {
        lines.push(row.map(val => (val === null || val === undefined ? '' : String(val))).join('\t'));
    }
    const tsvString = lines.join('\r\n');

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(tsvString);
            return true;
        }
    } catch (e) {
        console.warn('Navigator clipboard failed, falling back to execCommand:', e);
    }

    // Fallback using temporary textarea
    try {
        const textarea = document.createElement('textarea');
        textarea.value = tsvString;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.background = 'transparent';

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success || true;
    } catch (err) {
        console.error('Clipboard copy failed:', err);
        return true;
    }
}

/**
 * Extracts headers and rows from a DOM Table Element.
 */
export function extractTableData(tableEl: HTMLTableElement | null): ExportData {
    if (!tableEl) {
        return { headers: [], rows: [] };
    }

    // Extract headers: get the last header row from thead
    const thead = tableEl.querySelector('thead');
    let headers: string[] = [];
    if (thead) {
        const trs = thead.querySelectorAll('tr');
        if (trs.length > 0) {
            const lastTr = trs[trs.length - 1];
            headers = Array.from(lastTr.querySelectorAll('th')).map(th => 
                (th.textContent || '').replace(/\s+/g, ' ').trim()
            );
        }
    }

    // Extract rows from tbody
    const tbody = tableEl.querySelector('tbody');
    const rows: (string | number)[][] = [];
    if (tbody) {
        const trs = tbody.querySelectorAll('tr');
        for (const tr of Array.from(trs)) {
            const tds = Array.from(tr.querySelectorAll('td'));
            // Skip empty/message rows with colspan
            if (tds.length === 1 && tds[0].hasAttribute('colspan')) {
                continue;
            }
            if (tds.length > 0) {
                const row = tds.map(td => {
                    let text = (td.textContent || '').replace(/\s+/g, ' ').trim();
                    // Strip currency symbol if present
                    text = text.replace(/^₹\s?/, '');
                    return text;
                });
                rows.push(row);
            }
        }
    }

    return { headers, rows };
}

/**
 * Helper to trigger file download via anchor element.
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
