import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store, update } from '@/routes/tube-types';

type TubeType = { id: number; tube_name: string; basic_weight: string; status: string };

export default function TubeTypeForm({ tubeType }: { tubeType?: TubeType }) {
    const isEdit = !!tubeType;

    const { data, setData, post, put, processing, errors } = useForm({
        tube_name:    tubeType?.tube_name    ?? '',
        basic_weight: tubeType?.basic_weight ? parseFloat(tubeType.basic_weight).toFixed(3) : '',
        status:       tubeType?.status ?? 'Active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(update.url(tubeType!.id)) : post(store.url());
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Tube Type' : 'Add Tube Type'} />

            <div className="p-6">
                <div className="mb-6">
                    <Heading
                        title={isEdit ? 'Edit Tube Type' : 'Add Tube Type'}
                        description="Define a tube type and its basic weight in grams"
                    />
                </div>

                <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
                    <div>
                        <Label htmlFor="tube_name">Tube Name</Label>
                        <Input
                            id="tube_name"
                            value={data.tube_name}
                            onChange={(e) => setData('tube_name', e.target.value)}
                            placeholder="e.g. Standard Plastic Tube"
                            className="mt-1"
                        />
                        {errors.tube_name && <p className="mt-1 text-xs text-destructive">{errors.tube_name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="basic_weight">Basic Weight (g)</Label>
                        <Input
                            id="basic_weight"
                            type="number"
                            step="0.001"
                            min="0"
                            value={data.basic_weight}
                            onChange={(e) => setData('basic_weight', e.target.value)}
                            placeholder="0.000"
                            className="mt-1"
                        />
                        {errors.basic_weight && <p className="mt-1 text-xs text-destructive">{errors.basic_weight}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                            <SelectTrigger id="status" className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Update' : 'Create'}
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

TubeTypeForm.layout = {
    breadcrumbs: [
        { title: 'Tube Types', href: '/tube-types' },
        { title: 'Form', href: '#' },
    ],
};
