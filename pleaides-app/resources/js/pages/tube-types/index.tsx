import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit } from '@/routes/tube-types';

type TubeType = { id: number; tube_name: string; basic_weight: string; status: string };

export default function TubeTypesIndex({ tubeTypes }: { tubeTypes: TubeType[] }) {
    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        router.delete(destroy.url(id));
    };

    return (
        <>
            <Head title="Tube Types" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading title="Tube Types" description="Manage tube types and their basic weights" />
                    <Link href={create()}>
                        <Button>Add Tube Type</Button>
                    </Link>
                </div>

                {tubeTypes.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No tube types yet.{' '}
                        <Link href={create()} className="underline">Add the first one.</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Tube Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Basic Weight (g)</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {tubeTypes.map((t) => (
                                    <tr key={t.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{t.tube_name}</td>
                                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                            {parseFloat(t.basic_weight).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={t.status === 'Active' ? 'default' : 'secondary'}>
                                                {t.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit.url(t.id)}>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(t.id, t.tube_name)}
                                                >
                                                    Delete
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

TubeTypesIndex.layout = {
    breadcrumbs: [{ title: 'Tube Types', href: '/tube-types' }],
};
