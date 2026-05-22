import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/machine-types';

type MachineType = { id: number; type_name: string; description: string | null };

export default function MachineTypeForm({ machineType }: { machineType?: MachineType }) {
    const isEditing = !!machineType;

    const { data, setData, post, put, errors, processing } = useForm({
        type_name: machineType?.type_name ?? '',
        description: machineType?.description ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(machineType));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Machine Type' : 'New Machine Type'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Machine Type' : 'New Machine Type'}
                    description={isEditing ? 'Update the machine type details.' : 'Add a new machine type.'}
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="type_name">Name</Label>
                        <Input
                            id="type_name"
                            value={data.type_name}
                            onChange={(e) => setData('type_name', e.target.value)}
                            placeholder="e.g. Mixer, Filler, Conveyor"
                            required
                        />
                        <InputError message={errors.type_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Optional description"
                        />
                        <InputError message={errors.description} />
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

MachineTypeForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Machine Types', href: index() },
        { title: 'Form', href: '#' },
    ],
};
