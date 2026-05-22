import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store, update } from '@/routes/shift-groups';

type ShiftGroup = { id: number; group_name: string; leader_name: string; status: string };

export default function ShiftGroupForm({ shiftGroup }: { shiftGroup?: ShiftGroup }) {
    const isEditing = !!shiftGroup;

    const { data, setData, post, put, errors, processing } = useForm({
        group_name: shiftGroup?.group_name ?? '',
        leader_name: shiftGroup?.leader_name ?? '',
        status: shiftGroup?.status ?? 'Active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(shiftGroup));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Shift Group' : 'New Shift Group'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Shift Group' : 'New Shift Group'}
                    description="Manage shift group details and the current leader."
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="group_name">Group Name</Label>
                        <Input
                            id="group_name"
                            value={data.group_name}
                            onChange={(e) => setData('group_name', e.target.value)}
                            placeholder="e.g. Shift A, Night Crew"
                            required
                        />
                        <InputError message={errors.group_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="leader_name">Current Leader</Label>
                        <Input
                            id="leader_name"
                            value={data.leader_name}
                            onChange={(e) => setData('leader_name', e.target.value)}
                            placeholder="Full name"
                            required
                        />
                        <InputError message={errors.leader_name} />
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

ShiftGroupForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shift Groups', href: index() },
        { title: 'Form', href: '#' },
    ],
};
