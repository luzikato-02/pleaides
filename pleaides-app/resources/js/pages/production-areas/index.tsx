import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FilterBar } from '@/components/filter-bar';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useDataFilter } from '@/hooks/use-data-filter';
import { downloadCsv } from '@/lib/export-csv';
import { create, edit } from '@/routes/production-areas';

type ProductionArea = {
    id: number;
    area_name: string;
    description: string | null;
};

export default function ProductionAreasIndex({ productionAreas }: { productionAreas: ProductionArea[] }) {
    const { filtered, query, setQuery, clearAll, hasActiveFilters } = useDataFilter(productionAreas, {
        searchFn: (a, q) =>
            a.area_name.toLowerCase().includes(q) ||
            (a.description?.toLowerCase().includes(q) ?? false),
    });

    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete production area "${name}"? This cannot be undone.`)) return;
        router.delete(`/production-areas/${id}`);
    };

    return (
        <>
            <Head title="Production Areas" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Production Areas"
                        description="Define production areas to categorize machines."
                    />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Area
                        </Button>
                    </Link>
                </div>

                <FilterBar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search by name or description…' }}
                    resultCount={filtered.length}
                    totalCount={productionAreas.length}
                    onClear={clearAll}
                    hasActiveFilters={hasActiveFilters}
                    onExport={() =>
                        downloadCsv('production-areas', [
                            { header: 'Name', value: (r) => r.area_name },
                            { header: 'Description', value: (r) => r.description },
                        ], filtered)
                    }
                />

                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        {hasActiveFilters
                            ? 'No production areas match your filters.'
                            : 'No production areas yet.'}{' '}
                        {!hasActiveFilters && (
                            <Link href={create()} className="underline">
                                Add the first one.
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Area Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Description</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((area) => (
                                    <tr key={area.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{area.area_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {area.description ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(area)}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(area.id, area.area_name)}
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

ProductionAreasIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Production Areas', href: '/production-areas' },
    ],
};
