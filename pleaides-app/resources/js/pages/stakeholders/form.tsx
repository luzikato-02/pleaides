import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store, update } from '@/routes/stakeholders';

type Stakeholder = {
    id: number;
    name: string;
    email: string;
    scope: string;
    severity: string;
    status: string;
};

export default function StakeholderForm({ stakeholder }: { stakeholder?: Stakeholder }) {
    const isEditing = !!stakeholder;

    const { data, setData, post, put, errors, processing } = useForm({
        name: stakeholder?.name ?? '',
        email: stakeholder?.email ?? '',
        scope: stakeholder?.scope ?? 'all',
        severity: stakeholder?.severity ?? 'both',
        status: stakeholder?.status ?? 'Active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(stakeholder));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Stakeholder' : 'New Stakeholder'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Stakeholder' : 'New Stakeholder'}
                    description="Configure who receives cleaning alert emails and for which machines."
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scope">Scope</Label>
                        <Input
                            id="scope"
                            value={data.scope}
                            onChange={(e) => setData('scope', e.target.value)}
                            placeholder="all  OR  type_id:3  OR  location:Line A"
                        />
                        <p className="text-xs text-muted-foreground">
                            Use <code>all</code> for all machines, <code>type_id:ID</code> for a specific type, or{' '}
                            <code>location:Name</code> for a specific area.
                        </p>
                        <InputError message={errors.scope} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Receives</Label>
                        <Select value={data.severity} onValueChange={(v) => setData('severity', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">Both (Due Soon + Overdue)</SelectItem>
                                <SelectItem value="due-soon">Due Soon only</SelectItem>
                                <SelectItem value="overdue">Overdue only</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.severity} />
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

StakeholderForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Stakeholders', href: index() },
        { title: 'Form', href: '#' },
    ],
};
