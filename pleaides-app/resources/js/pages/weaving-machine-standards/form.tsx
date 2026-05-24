import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store, update } from '@/routes/weaving-machine-standards';

type Machine = { id: number; machine_name: string; machine_code: string };
type Standard = { id: number; machine_id: number; standard_creel_length: string; quality_factor: string; tolerance_kg: string | null };

export default function WeavingMachineStandardForm({
    standard,
    availableMachines,
}: {
    standard?: Standard;
    availableMachines: Machine[];
}) {
    const isEditing = !!standard;

    const { data, setData, post, put, errors, processing } = useForm({
        machine_id: standard?.machine_id?.toString() ?? '',
        standard_creel_length: standard ? parseFloat(standard.standard_creel_length).toFixed(3) : '',
        quality_factor: standard ? parseFloat(standard.quality_factor).toFixed(4) : '1.0000',
        tolerance_kg: standard?.tolerance_kg ? parseFloat(standard.tolerance_kg).toFixed(3) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(standard));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Weaving Standard' : 'New Weaving Standard'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Weaving Standard' : 'New Weaving Standard'}
                    description={
                        isEditing
                            ? 'Update the standard parameters for this machine.'
                            : 'Configure standard parameters for a weaving machine.'
                    }
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label>Machine</Label>
                        <Select
                            value={data.machine_id}
                            onValueChange={(v) => setData('machine_id', v)}
                            disabled={isEditing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select weaving machine" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMachines.map((m) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>
                                        {m.machine_name}{' '}
                                        <span className="text-muted-foreground">({m.machine_code})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.machine_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="standard_creel_length">Standard Creel Length (m)</Label>
                        <Input
                            id="standard_creel_length"
                            type="number"
                            step="0.001"
                            min="0"
                            value={data.standard_creel_length}
                            onChange={(e) => setData('standard_creel_length', e.target.value)}
                            placeholder="e.g. 1500.000"
                            required
                        />
                        <InputError message={errors.standard_creel_length} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="quality_factor">Quality Factor</Label>
                        <Input
                            id="quality_factor"
                            type="number"
                            step="0.0001"
                            min="0"
                            value={data.quality_factor}
                            onChange={(e) => setData('quality_factor', e.target.value)}
                            placeholder="e.g. 1.0500"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Used to calculate standard waste: G/m × creel length × quality factor
                        </p>
                        <InputError message={errors.quality_factor} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tolerance_kg">Waste Tolerance (kg)</Label>
                        <Input
                            id="tolerance_kg"
                            type="number"
                            step="0.001"
                            min="0"
                            value={data.tolerance_kg}
                            onChange={(e) => setData('tolerance_kg', e.target.value)}
                            placeholder="e.g. 10.000"
                        />
                        <p className="text-xs text-muted-foreground">
                            If |waste estimate − standard waste| is below this threshold, no length adjustment is suggested.
                        </p>
                        <InputError message={errors.tolerance_kg} />
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

WeavingMachineStandardForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Weaving Standards', href: index() },
        { title: 'Form', href: '#' },
    ],
};
