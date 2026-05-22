import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { downloadCsv } from '@/lib/export-csv';
import { create, edit } from '@/routes/cleaning-cycles';

type Cycle = {
    id: number;
    frequency_value: number;
    frequency_unit: string;
    cleaning_steps: string | null;
    effective_date: string;
    is_active: boolean;
    machine_type: { type_name: string } | null;
};

export default function CleaningCyclesIndex({ cycles }: { cycles: Cycle[] }) {
    const typeOptions = useMemo(
        () =>
            [...new Set(cycles.map((c) => c.machine_type?.type_name).filter(Boolean))]
                .sort()
                .map((t) => ({ value: t!, label: t! })),
        [cycles],
    );

    const { filtered, query, setQuery, filterValues, setFilter, clearAll, hasActiveFilters } =
        useDataFilter(cycles, {
            searchFn: (c, q) =>
                (c.machine_type?.type_name.toLowerCase().includes(q) ?? false) ||
                (c.cleaning_steps?.toLowerCase().includes(q) ?? false),
            filters: [
                {
                    key: 'type',
                    label: 'Type',
                    options: typeOptions,
                    match: (c, v) => c.machine_type?.type_name === v,
                },
                {
                    key: 'active',
                    label: 'Active',
                    options: [
                        { value: 'yes', label: 'Active' },
                        { value: 'no', label: 'Inactive' },
                    ],
                    match: (c, v) => (v === 'yes' ? c.is_active : !c.is_active),
                },
                {
                    key: 'unit',
                    label: 'Unit',
                    options: [
                        { value: 'days', label: 'Days' },
                        { value: 'weeks', label: 'Weeks' },
                    ],
                    match: (c, v) => c.frequency_unit === v,
                },
            ],
        });

    const handleDelete = (id: number) => {
        if (!window.confirm('Delete this cleaning cycle?')) return;
        router.delete(`/cleaning-cycles/${id}`);
    };

    return (
        <>
            <Head title="Cleaning Cycles" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Cleaning Cycles" description="Define cleaning frequency standards per machine type." />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Cycle
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by type or steps…' }}
                    selects={[
                        { key: 'type', label: 'Type', value: filterValues.type ?? '', options: typeOptions, onChange: (v) => setFilter('type', v) },
                        { key: 'active', label: 'Active', value: filterValues.active ?? '', options: [
                            { value: 'yes', label: 'Active' },
                            { value: 'no', label: 'Inactive' },
                        ], onChange: (v) => setFilter('active', v) },
                        { key: 'unit', label: 'Unit', value: filterValues.unit ?? '', options: [
                            { value: 'days', label: 'Days' },
                            { value: 'weeks', label: 'Weeks' },
                        ], onChange: (v) => setFilter('unit', v) },
                    ]}
                    resultCount={filtered.length}
                    totalCount={cycles.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('cleaning-cycles', [
                            { header: 'Machine Type', value: (r) => r.machine_type?.type_name },
                            { header: 'Frequency', value: (r) => r.frequency_value },
                            { header: 'Unit', value: (r) => r.frequency_unit },
                            { header: 'Effective Date', value: (r) => r.effective_date },
                            { header: 'Active', value: (r) => (r.is_active ? 'Yes' : 'No') },
                            { header: 'Cleaning Steps', value: (r) => r.cleaning_steps },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? 'No cycles match your filters.' : 'No cleaning cycles yet.'}{' '}
                        {!hasActiveFilters && <Link href={create()} className="underline">Add the first one.</Link>}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Machine Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Frequency</th>
                                    <th className="px-4 py-3 text-left font-medium">Effective Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Active</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((cycle) => (
                                    <tr key={cycle.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{cycle.machine_type?.type_name ?? '—'}</td>
                                        <td className="px-4 py-3">{cycle.frequency_value} {cycle.frequency_unit}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{cycle.effective_date}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={cycle.is_active ? 'default' : 'secondary'}>
                                                {cycle.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(cycle)}>
                                                    <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /></Button>
                                                </Link>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(cycle.id)}>
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

CleaningCyclesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Cycles', href: '/cleaning-cycles' },
    ],
};
