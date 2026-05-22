import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store, update } from '@/routes/cleaning-cycles';

type MachineType = { id: number; type_name: string };
type Cycle = {
    id: number;
    type_id: number;
    frequency_value: number;
    frequency_unit: string;
    cleaning_steps: string | null;
    effective_date: string;
    is_active: boolean;
};

export default function CleaningCycleForm({
    cycle,
    machineTypes,
}: {
    cycle?: Cycle;
    machineTypes: MachineType[];
}) {
    const isEditing = !!cycle;

    const { data, setData, post, put, errors, processing } = useForm({
        type_id: cycle?.type_id?.toString() ?? '',
        frequency_value: cycle?.frequency_value?.toString() ?? '7',
        frequency_unit: cycle?.frequency_unit ?? 'days',
        cleaning_steps: cycle?.cleaning_steps ?? '',
        effective_date: cycle?.effective_date ?? new Date().toISOString().slice(0, 10),
        is_active: cycle?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(cycle));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Cleaning Cycle' : 'New Cleaning Cycle'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Cleaning Cycle' : 'New Cleaning Cycle'}
                    description="Set the standard cleaning frequency for a machine type."
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="frequency_value">Frequency</Label>
                            <Input
                                id="frequency_value"
                                type="number"
                                min="1"
                                value={data.frequency_value}
                                onChange={(e) => setData('frequency_value', e.target.value)}
                                required
                            />
                            <InputError message={errors.frequency_value} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Unit</Label>
                            <Select value={data.frequency_unit} onValueChange={(v) => setData('frequency_unit', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="effective_date">Effective Date</Label>
                        <Input
                            id="effective_date"
                            type="date"
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                            required
                        />
                        <InputError message={errors.effective_date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cleaning_steps">Cleaning Steps / Checklist</Label>
                        <textarea
                            id="cleaning_steps"
                            value={data.cleaning_steps}
                            onChange={(e) => setData('cleaning_steps', e.target.value)}
                            rows={5}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Step 1: ...\nStep 2: ..."
                        />
                        <InputError message={errors.cleaning_steps} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <Label htmlFor="is_active">
                            Set as active cycle for this machine type
                        </Label>
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

CleaningCycleForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Cycles', href: index() },
        { title: 'Form', href: '#' },
    ],
};
