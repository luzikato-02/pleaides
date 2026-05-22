import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store } from '@/routes/cleaning-records';

type Machine = { id: number; machine_name: string; machine_code: string };
type ShiftGroup = { id: number; group_name: string; leader_name: string };

export default function LogCleaning({
    machines,
    shiftGroups,
}: {
    machines: Machine[];
    shiftGroups: ShiftGroup[];
}) {
    const { data, setData, post, errors, processing } = useForm({
        machine_id: '',
        cleaning_date: new Date().toISOString().slice(0, 10),
        performed_by_group_id: '',
        started_by_group_id: '',
        notes: '',
    });

    useEffect(() => {
        if (data.performed_by_group_id && !data.started_by_group_id) {
            setData('started_by_group_id', data.performed_by_group_id);
        }
    }, [data.performed_by_group_id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const performerGroup = shiftGroups.find((g) => g.id.toString() === data.performed_by_group_id);
    const starterGroup = shiftGroups.find((g) => g.id.toString() === data.started_by_group_id);

    return (
        <>
            <Head title="Log Cleaning" />

            <div className="p-6">
                <Heading
                    title="Log Cleaning"
                    description="Record a machine cleaning. Leader names are snapshotted from the current group leader."
                />

                <form onSubmit={submit} className="mt-6 max-w-xl space-y-6">
                    <div className="grid gap-2">
                        <Label>Machine</Label>
                        <Select value={data.machine_id} onValueChange={(v) => setData('machine_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select machine" />
                            </SelectTrigger>
                            <SelectContent>
                                {machines.map((m) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>
                                        {m.machine_name} <span className="text-muted-foreground">({m.machine_code})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.machine_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cleaning_date">Cleaning Date</Label>
                        <Input
                            id="cleaning_date"
                            type="date"
                            value={data.cleaning_date}
                            onChange={(e) => setData('cleaning_date', e.target.value)}
                            required
                        />
                        <InputError message={errors.cleaning_date} />
                    </div>

                    <div className="rounded-lg border p-4 space-y-4">
                        <h3 className="font-medium text-sm">Performed By</h3>

                        <div className="grid gap-2">
                            <Label>Shift Group</Label>
                            <Select
                                value={data.performed_by_group_id}
                                onValueChange={(v) => setData('performed_by_group_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftGroups.map((g) => (
                                        <SelectItem key={g.id} value={g.id.toString()}>
                                            {g.group_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.performed_by_group_id} />
                        </div>

                        {performerGroup && (
                            <p className="text-sm text-muted-foreground">
                                Leader snapshot: <strong>{performerGroup.leader_name}</strong>
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border p-4 space-y-4">
                        <h3 className="font-medium text-sm">Restarted By</h3>

                        <div className="grid gap-2">
                            <Label>Shift Group</Label>
                            <Select
                                value={data.started_by_group_id}
                                onValueChange={(v) => setData('started_by_group_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group (defaults to performer)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftGroups.map((g) => (
                                        <SelectItem key={g.id} value={g.id.toString()}>
                                            {g.group_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.started_by_group_id} />
                        </div>

                        {starterGroup && (
                            <p className="text-sm text-muted-foreground">
                                Leader snapshot: <strong>{starterGroup.leader_name}</strong>
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Optional notes"
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            Submit Cleaning Record
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

LogCleaning.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Records', href: index() },
        { title: 'Log Cleaning', href: '#' },
    ],
};
