import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { downloadCsv } from '@/lib/export-csv';
import { create, edit } from '@/routes/machines';

type Machine = {
    id: number;
    machine_code: string;
    machine_name: string;
    location: string | null;
    status: string;
    due_status: string;
    machine_type: { type_name: string } | null;
    latest_cleaning_record: { next_due_date: string } | null;
};

const dueVariant = (s: string) => {
    if (s === 'Overdue') return 'destructive' as const;
    if (s === 'Due soon') return 'secondary' as const;
    if (s === 'OK') return 'default' as const;
    return 'outline' as const;
};

export default function MachinesIndex({ machines }: { machines: Machine[] }) {
    const typeOptions = useMemo(
        () =>
            [...new Set(machines.map((m) => m.machine_type?.type_name).filter(Boolean))]
                .sort()
                .map((t) => ({ value: t!, label: t! })),
        [machines],
    );

    const locationOptions = useMemo(
        () =>
            [...new Set(machines.map((m) => m.location).filter(Boolean))]
                .sort()
                .map((l) => ({ value: l!, label: l! })),
        [machines],
    );

    const { filtered, query, setQuery, filterValues, setFilter, clearAll, hasActiveFilters } =
        useDataFilter(machines, {
            searchFn: (m, q) =>
                m.machine_name.toLowerCase().includes(q) ||
                m.machine_code.toLowerCase().includes(q) ||
                (m.location?.toLowerCase().includes(q) ?? false),
            filters: [
                {
                    key: 'type',
                    label: 'Type',
                    options: typeOptions,
                    match: (m, v) => m.machine_type?.type_name === v,
                },
                {
                    key: 'location',
                    label: 'Location',
                    options: locationOptions,
                    match: (m, v) => m.location === v,
                },
                {
                    key: 'status',
                    label: 'Status',
                    options: [
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'Decommissioned', label: 'Decommissioned' },
                    ],
                    match: (m, v) => m.status === v,
                },
                {
                    key: 'due_status',
                    label: 'Cleaning',
                    options: [
                        { value: 'OK', label: 'OK' },
                        { value: 'Due soon', label: 'Due Soon' },
                        { value: 'Overdue', label: 'Overdue' },
                        { value: 'No Record', label: 'No Record' },
                    ],
                    match: (m, v) => m.due_status === v,
                },
            ],
        });

    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete machine "${name}"?`)) return;
        router.delete(`/machines/${id}`);
    };

    return (
        <>
            <Head title="Machines" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Machines" description="All physical machines and their current cleaning status." />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Machine
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by name, code, or location…' }}
                    selects={[
                        { key: 'type', label: 'Type', value: filterValues.type ?? '', options: typeOptions, onChange: (v) => setFilter('type', v) },
                        { key: 'location', label: 'Location', value: filterValues.location ?? '', options: locationOptions, onChange: (v) => setFilter('location', v) },
                        { key: 'status', label: 'Status', value: filterValues.status ?? '', options: [
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                            { value: 'Decommissioned', label: 'Decommissioned' },
                        ], onChange: (v) => setFilter('status', v) },
                        { key: 'due_status', label: 'Cleaning', value: filterValues.due_status ?? '', options: [
                            { value: 'OK', label: 'OK' },
                            { value: 'Due soon', label: 'Due Soon' },
                            { value: 'Overdue', label: 'Overdue' },
                            { value: 'No Record', label: 'No Record' },
                        ], onChange: (v) => setFilter('due_status', v) },
                    ]}
                    resultCount={filtered.length}
                    totalCount={machines.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('machines', [
                            { header: 'Code', value: (r) => r.machine_code },
                            { header: 'Name', value: (r) => r.machine_name },
                            { header: 'Type', value: (r) => r.machine_type?.type_name },
                            { header: 'Location', value: (r) => r.location },
                            { header: 'Status', value: (r) => r.status },
                            { header: 'Next Due', value: (r) => r.latest_cleaning_record?.next_due_date },
                            { header: 'Cleaning Status', value: (r) => r.due_status },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? 'No machines match your filters.' : 'No machines yet.'}{' '}
                        {!hasActiveFilters && <Link href={create()} className="underline">Add the first one.</Link>}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Code</th>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Location</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Next Due</th>
                                    <th className="px-4 py-3 text-left font-medium">Cleaning</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((machine) => (
                                    <tr key={machine.id} className="border-t">
                                        <td className="px-4 py-3 font-mono text-xs">{machine.machine_code}</td>
                                        <td className="px-4 py-3 font-medium">{machine.machine_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{machine.machine_type?.type_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{machine.location ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={machine.status === 'Active' ? 'default' : 'secondary'}>{machine.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3">{machine.latest_cleaning_record?.next_due_date ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={dueVariant(machine.due_status)}>{machine.due_status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(machine)}>
                                                    <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /></Button>
                                                </Link>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(machine.id, machine.machine_name)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

MachinesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Machines', href: '/machines' },
    ],
};
