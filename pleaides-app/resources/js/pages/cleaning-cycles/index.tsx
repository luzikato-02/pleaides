import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const handleDelete = (id: number) => {
        if (!window.confirm('Delete this cleaning cycle?')) return;
        router.delete(`/cleaning-cycles/${id}`);
    };

    return (
        <>
            <Head title="Cleaning Cycles" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Cleaning Cycles"
                        description="Define cleaning frequency standards per machine type."
                    />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Cycle
                        </Button>
                    </Link>
                </div>

                {cycles.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No cleaning cycles yet.{' '}
                        <Link href={create()} className="underline">
                            Add the first one.
                        </Link>
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
                                {cycles.map((cycle) => (
                                    <tr key={cycle.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{cycle.machine_type?.type_name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            {cycle.frequency_value} {cycle.frequency_unit}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{cycle.effective_date}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={cycle.is_active ? 'default' : 'secondary'}>
                                                {cycle.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(cycle)}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(cycle.id)}
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

CleaningCyclesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Cycles', href: '/cleaning-cycles' },
    ],
};
