import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { downloadCsv } from '@/lib/export-csv';
import { create, edit } from '@/routes/machine-types';

type MachineType = {
    id: number;
    type_name: string;
    description: string | null;
    machines_count: number;
};

export default function MachineTypesIndex({ machineTypes }: { machineTypes: MachineType[] }) {
    const { filtered, query, setQuery, clearAll, hasActiveFilters } = useDataFilter(machineTypes, {
        searchFn: (t, q) =>
            t.type_name.toLowerCase().includes(q) ||
            (t.description?.toLowerCase().includes(q) ?? false),
    });

    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete machine type "${name}"? This cannot be undone.`)) return;
        router.delete(`/machine-types/${id}`);
    };

    return (
        <>
            <Head title="Machine Types" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Machine Types" description="Define types of machines and anchor their cleaning cycles." />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Type
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by name or description…' }}
                    resultCount={filtered.length}
                    totalCount={machineTypes.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('machine-types', [
                            { header: 'Name', value: (r) => r.type_name },
                            { header: 'Description', value: (r) => r.description },
                            { header: 'Machines', value: (r) => r.machines_count },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? 'No machine types match your filters.' : 'No machine types yet.'}{' '}
                        {!hasActiveFilters && (
                            <Link href={create()} className="underline">Add the first one.</Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Description</th>
                                    <th className="px-4 py-3 text-left font-medium">Machines</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((type) => (
                                    <tr key={type.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{type.type_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{type.description ?? '—'}</td>
                                        <td className="px-4 py-3">{type.machines_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(type)}>
                                                    <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /></Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(type.id, type.type_name)}
                                                    disabled={type.machines_count > 0}
                                                >
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

MachineTypesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Machine Types', href: '/machine-types' },
    ],
};
