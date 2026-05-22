import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Delete stakeholder "${name}"?`)) return;
        router.delete(`/stakeholders/${id}`);
    };

    return (
        <>
            <Head title="Stakeholders" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Stakeholders"
                        description="Alert recipients and their notification scope."
                    />
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Stakeholder
                        </Button>
                    </Link>
                </div>

                {stakeholders.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No stakeholders yet.{' '}
                        <Link href={create()} className="underline">
                            Add the first one.
                        </Link>
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
                                {stakeholders.map((s) => (
                                    <tr key={s.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                                        <td className="px-4 py-3">{s.scope}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{s.severity}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={s.status === 'Active' ? 'default' : 'secondary'}>
                                                {s.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(s)}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(s.id, s.name)}
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

StakeholdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Stakeholders', href: '/stakeholders' },
    ],
};
