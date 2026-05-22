import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FilterBar } from '@/components/filter-bar';
import { downloadCsv } from '@/lib/export-csv';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { create, edit } from '@/routes/shift-groups';

type ShiftGroup = {
    id: number;
    group_name: string;
    leader_name: string;
    status: 'Active' | 'Inactive';
};

export default function ShiftGroupsIndex({ shiftGroups }: { shiftGroups: ShiftGroup[] }) {
    const { filtered, query, setQuery, filterValues, setFilter, clearAll, hasActiveFilters } =
        useDataFilter(shiftGroups, {
            searchFn: (g, q) =>
                g.group_name.toLowerCase().includes(q) ||
                g.leader_name.toLowerCase().includes(q),
            filters: [
                {
                    key: 'status',
                    label: 'Status',
                    options: [
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                    ],
                    match: (g, v) => g.status === v,
                },
            ],
        });

    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete shift group "${name}"?`)) return;
        router.delete(`/shift-groups/${id}`);
    };

    return (
        <>
            <Head title="Shift Groups" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Shift Groups" description="Manage groups and their current leaders." />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Group
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by group name or leader…' }}
                    selects={[
                        { key: 'status', label: 'Status', value: filterValues.status ?? '', options: [
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                        ], onChange: (v) => setFilter('status', v) },
                    ]}
                    resultCount={filtered.length}
                    totalCount={shiftGroups.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('shift-groups', [
                            { header: 'Group Name', value: (r) => r.group_name },
                            { header: 'Leader Name', value: (r) => r.leader_name },
                            { header: 'Status', value: (r) => r.status },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters ? 'No groups match your filters.' : 'No shift groups yet.'}{' '}
                        {!hasActiveFilters && <Link href={create()} className="underline">Add the first one.</Link>}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Group Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Current Leader</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((group) => (
                                    <tr key={group.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{group.group_name}</td>
                                        <td className="px-4 py-3">{group.leader_name}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={group.status === 'Active' ? 'default' : 'secondary'}>{group.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(group)}>
                                                    <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /></Button>
                                                </Link>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(group.id, group.group_name)}>
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

ShiftGroupsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shift Groups', href: '/shift-groups' },
    ],
};
