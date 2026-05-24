import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, edit } from '@/routes/weaving-machine-standards';

type WeavingStandard = {
    id: number;
    standard_creel_length: string;
    quality_factor: string;
    tolerance_kg: string | null;
    machine: { id: number; machine_name: string; machine_code: string; status: string };
};

type Machine = {
    id: number;
    machine_name: string;
    machine_code: string;
    status: string;
    weaving_standard: WeavingStandard | null;
};

export default function WeavingMachineStandardsIndex({ machines }: { machines: Machine[] }) {
    const handleDelete = (id: number, name: string) => {
        if (!window.confirm(`Remove standard for "${name}"?`)) return;
        router.delete(`/weaving-machine-standards/${id}`);
    };

    const configured = machines.filter((m) => m.weaving_standard !== null);
    const unconfigured = machines.filter((m) => m.weaving_standard === null);

    return (
        <>
            <Head title="Weaving Machine Standards" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Weaving Machine Standards"
                        description="Configure standard creel length and quality factor per weaving machine."
                    />
                    {unconfigured.length > 0 && (
                        <Link href={create()}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Standard
                            </Button>
                        </Link>
                    )}
                </div>

                {machines.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No weaving machines found. Assign machines to the "Weaving" production area first.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Machine</th>
                                    <th className="px-4 py-3 text-left font-medium">Code</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Std Creel Length</th>
                                    <th className="px-4 py-3 text-left font-medium">Quality Factor</th>
                                    <th className="px-4 py-3 text-left font-medium">Waste Tolerance</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configured.map((machine) => (
                                    <tr key={machine.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{machine.machine_name}</td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">
                                            {machine.machine_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={machine.status === 'Active' ? 'default' : 'secondary'}>
                                                {machine.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {parseFloat(machine.weaving_standard!.standard_creel_length).toFixed(3)} m
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {parseFloat(machine.weaving_standard!.quality_factor).toFixed(4)}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                            {machine.weaving_standard!.tolerance_kg != null
                                                ? `${parseFloat(machine.weaving_standard!.tolerance_kg).toFixed(3)} kg`
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={edit(machine.weaving_standard!)}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(machine.weaving_standard!.id, machine.machine_name)
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {unconfigured.map((machine) => (
                                    <tr key={machine.id} className="border-t opacity-50">
                                        <td className="px-4 py-3 font-medium">{machine.machine_name}</td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">
                                            {machine.machine_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={machine.status === 'Active' ? 'default' : 'secondary'}>
                                                {machine.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                                            Not configured
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={create()}>
                                                <Button variant="outline" size="sm">
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Configure
                                                </Button>
                                            </Link>
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

WeavingMachineStandardsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Weaving Standards', href: '/weaving-machine-standards' },
    ],
};
