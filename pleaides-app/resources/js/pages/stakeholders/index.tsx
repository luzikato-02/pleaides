import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FilterBar } from '@/components/filter-bar';
import { downloadCsv } from '@/lib/export-csv';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { create, edit } from '@/routes/stakeholders';

type Stakeholder = {
    id: number;
    name: string;
    email: string;
    scope: string;
    severity: string;
    status: string;
};

export default function StakeholdersIndex({ stakeholders }: { stakeholders: Stakeholder[] }) {
    const { filtered, query, setQuery, filterValues, setFilter, clearAll, hasActiveFilters } =
        useDataFilter(stakeholders, {
            searchFn: (s, q) =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.scope.toLowerCase().includes(q),
            filters: [
                {
                    key: 'status',
                    label: 'Status',
                    options: [
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                    ],
                    match: (s, v) => s.status === v,
                },
                {
                    key: 'severity',
                    label: 'Receives',
                    options: [
                        { value: 'both', label: 'Both' },
                        { value: 'due-soon', label: 'Due Soon' },
                        { value: 'overdue', label: 'Overdue' },
                    ],
                    match: (s, v) => s.severity === v,
                },
            ],
        });

    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete stakeholder "${name}"?`)) return;
        router.delete(`/stakeholders/${id}`);
    };

    return (
        <>
            <Head title="Stakeholders" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Stakeholders" description="Alert recipients and their notification scope." />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Stakeholder
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by name, email, or scope…' }}
                    selects={[
                        { key: 'status', label: 'Status', value: filterValues.status ?? '', options: [
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                        ], onChange: (v) => setFilter('status', v) },
                        { key: 'severity', label: 'Receives', value: filterValues.severity ?? '', options: [
                            { value: 'both', label: 'Both' },
                            { value: 'due-soon', label: 'Due Soon' },
                            { value: 'overdue', label: 'Overdue' },
                        ], onChange: (v) => setFilter('severity', v) },
                    ]}
                    resultCount={filtered.length}
                    totalCount={stakeholders.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('stakeholders', [
                            { header: 'Name', value: (r) => r.name },
                            { header: 'Email', value: (r) => r.email },
                            { header: 'Scope', value: (r) => r.scope },
                            { header: 'Receives', value: (r) => r.severity },
                            { header: 'Status', value: (r) => r.status },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? 'No stakeholders match your filters.' : 'No stakeholders yet.'}{' '}
                        {!hasActiveFilters && <Link href={create()} className="underline">Add the first one.</Link>}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Email</th>
                                    <th className="px-4 py-3 text-left font-medium">Scope</th>
                                    <th className="px-4 py-3 text-left font-medium">Receives</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                                        <td className="px-4 py-3">{s.scope}</td>
                                        <td className="px-4 py-3"><Badge variant="outline">{s.severity}</Badge></td>
                                        <td className="px-4 py-3">
                                            <Badge variant={s.status === 'Active' ? 'default' : 'secondary'}>{s.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(s)}>
                                                    <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /></Button>
                                                </Link>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(s.id, s.name)}>
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

StakeholdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Stakeholders', href: '/stakeholders' },
    ],
};
