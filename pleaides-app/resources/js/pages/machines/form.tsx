import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store, update } from '@/routes/machines';

type MachineType = { id: number; type_name: string };
type ProductionArea = { id: number; area_name: string };
type Machine = {
    id: number;
    machine_code: string;
    machine_name: string;
    type_id: number;
    production_area_id: number | null;
    location: string | null;
    status: string;
};

export default function MachineForm({
    machine,
    machineTypes,
    productionAreas,
}: {
    machine?: Machine;
    machineTypes: MachineType[];
    productionAreas: ProductionArea[];
}) {
    const isEditing = !!machine;

    const { data, setData, post, put, errors, processing } = useForm({
        machine_code: machine?.machine_code ?? '',
        machine_name: machine?.machine_name ?? '',
        type_id: machine?.type_id?.toString() ?? '',
        production_area_id: machine?.production_area_id?.toString() ?? '',
        location: machine?.location ?? '',
        status: machine?.status ?? 'Active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(machine));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Machine' : 'New Machine'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Machine' : 'New Machine'}
                    description={isEditing ? 'Update machine details.' : 'Register a new physical machine.'}
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="machine_code">Asset Code</Label>
                        <Input
                            id="machine_code"
                            value={data.machine_code}
                            onChange={(e) => setData('machine_code', e.target.value)}
                            placeholder="e.g. FILL-03"
                            required
                        />
                        <InputError message={errors.machine_code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="machine_name">Machine Name</Label>
                        <Input
                            id="machine_name"
                            value={data.machine_name}
                            onChange={(e) => setData('machine_name', e.target.value)}
                            placeholder="Descriptive name"
                            required
                        />
                        <InputError message={errors.machine_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Machine Type</Label>
                        <Select value={data.type_id} onValueChange={(v) => setData('type_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {machineTypes.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {t.type_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Production Area</Label>
                        <Select
                            value={data.production_area_id}
                            onValueChange={(v) => setData('production_area_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select area (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {productionAreas.map((a) => (
                                    <SelectItem key={a.id} value={a.id.toString()}>
                                        {a.area_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.production_area_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Line / Area (optional)"
                        />
                        <InputError message={errors.location} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

MachineForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Machines', href: index() },
        { title: 'Form', href: '#' },
    ],
};
