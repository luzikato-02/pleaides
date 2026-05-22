export type CsvColumn<T> = {
    header: string;
    value: (row: T) => string | number | null | undefined;
};

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const header = columns.map((c) => escape(c.header)).join(',');
    const body = rows
        .map((row) => columns.map((c) => escape(c.value(row))).join(','))
        .join('\n');

    // UTF-8 BOM so Excel opens it correctly
    const csv = '﻿' + header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
