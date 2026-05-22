import { Head, Link, router } from '@inertiajs/react';
import { Download, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { create, index } from '@/routes/cleaning-records';

type CleaningRecord = {
    id: number;
    cleaning_date: string;
    next_due_date: string;
    duration_since_last: number | null;
    performed_by_leader: string;
    started_by_leader: string;
    notes: string | null;
    machine: { machine_name: string; machine_code: string } | null;
    performed_by_group: { group_name: string } | null;
    started_by_group: { group_name: string } | null;
};

type PaginatedData<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type FilterValues = {
    search?: string;
    machine_id?: string;
    group_id?: string;
    date_from?: string;
    date_to?: string;
};

type Props = {
    records: PaginatedData<CleaningRecord>;
    machines: { id: number; machine_name: string; machine_code: string }[];
    shiftGroups: { id: number; group_name: string }[];
    filters: FilterValues;
};

export default function CleaningRecordsIndex({ records, machines, shiftGroups, filters }: Props) {
    const [local, setLocal] = useState<FilterValues>(filters);

    const apply = useCallback(
        (next: FilterValues) => {
            setLocal(next);
            const params = Object.fromEntries(
                Object.entries(next).filter(([, v]) => v !== '' && v != null),
            );
            router.get(index.url(), params, { preserveState: true, preserveScroll: true, replace: true });
        },
        [],
    );

    const set = (key: keyof FilterValues, value: string) => apply({ ...local, [key]: value });
    const clearAll = () => apply({ search: '', machine_id: '', group_id: '', date_from: '', date_to: '' });

    const hasActiveFilters = Object.values(local).some((v) => v !== '' && v != null);

    return (
        <>
            <Head title="Cleaning Records" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Cleaning Records" description="Append-only log of all machine cleanings." />
                    <Link href={create()}>
                        <Button>Log Cleaning</Button>
                    </Link>
                </div>

                {/* Filter bar */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="h-9 pl-8 text-sm"
                            placeholder="Search by machine, code, or leader…"
                            value={local.search ?? ''}
                            onChange={(e) => set('search', e.target.value)}
                        />
                    </div>

                    {/* Machine */}
                    <Select value={local.machine_id || '__all__'} onValueChange={(v) => set('machine_id', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[180px] text-sm">
                            <SelectValue placeholder="All Machines" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Machines</SelectItem>
                            {machines.map((m) => (
                                <SelectItem key={m.id} value={m.id.toString()}>
                                    {m.machine_name} <span className="text-muted-foreground">({m.machine_code})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Group */}
                    <Select value={local.group_id || '__all__'} onValueChange={(v) => set('group_id', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-9 w-[160px] text-sm">
                            <SelectValue placeholder="All Teams" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Teams</SelectItem>
                            {shiftGroups.map((g) => (
                                <SelectItem key={g.id} value={g.id.toString()}>{g.group_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date range */}
                    <div className="flex items-center gap-1">
                        <Input
                            type="date"
                            className="h-9 w-[140px] text-sm"
                            value={local.date_from ?? ''}
                            onChange={(e) => set('date_from', e.target.value)}
                            title="From date"
                        />
                        <span className="text-muted-foreground text-xs">–</span>
                        <Input
                            type="date"
                            className="h-9 w-[140px] text-sm"
                            value={local.date_to ?? ''}
                            onChange={(e) => set('date_to', e.target.value)}
                            title="To date"
                        />
                    </div>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-9 gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear
                            </Button>
                            <span className="whitespace-nowrap text-sm text-muted-foreground">
                                {records.total} result{records.total !== 1 ? 's' : ''}
                            </span>
                        </>
                    )}

                    {/* Server-side export — passes current filters to the CSV endpoint */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-9 gap-1.5"
                        onClick={() => {
                            const params = new URLSearchParams(
                                Object.entries(local).filter(([, v]) => v !== '' && v != null) as [string, string][],
                            );
                            window.location.href = `/cleaning-records/export?${params}`;
                        }}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </Button>
                </div>

                {records.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? (
                            'No records match your filters.'
                        ) : (
                            <>No cleaning records yet.{' '}
                                <Link href={create()} className="underline">Log the first cleaning.</Link>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Machine</th>
                                        <th className="px-4 py-3 text-left font-medium">Cleaned On</th>
                                        <th className="px-4 py-3 text-left font-medium">Performed By</th>
                                        <th className="px-4 py-3 text-left font-medium">Restarted By</th>
                                        <th className="px-4 py-3 text-left font-medium">Days Since Last</th>
                                        <th className="px-4 py-3 text-left font-medium">Next Due</th>
                                        <th className="px-4 py-3 text-left font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.map((record) => (
                                        <tr key={record.id} className="border-t">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{record.machine?.machine_name}</div>
                                                <div className="font-mono text-xs text-muted-foreground">{record.machine?.machine_code}</div>
                                            </td>
                                            <td className="px-4 py-3">{record.cleaning_date}</td>
                                            <td className="px-4 py-3">
                                                <div>{record.performed_by_group?.group_name}</div>
                                                <div className="text-xs text-muted-foreground">{record.performed_by_leader}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{record.started_by_group?.group_name}</div>
                                                <div className="text-xs text-muted-foreground">{record.started_by_leader}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {record.duration_since_last != null ? `${record.duration_since_last} days` : '—'}
                                            </td>
                                            <td className="px-4 py-3">{record.next_due_date}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{record.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {records.last_page > 1 && (
                            <div className="mt-4 flex justify-between text-sm">
                                {records.prev_page_url ? (
                                    <Link href={records.prev_page_url} className="underline">Previous</Link>
                                ) : <span />}
                                <span className="text-muted-foreground">
                                    Page {records.current_page} of {records.last_page}
                                </span>
                                {records.next_page_url ? (
                                    <Link href={records.next_page_url} className="underline">Next</Link>
                                ) : <span />}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

CleaningRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Records', href: '/cleaning-records' },
    ],
};
