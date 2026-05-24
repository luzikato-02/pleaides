import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/production-areas';

type ProductionArea = { id: number; area_name: string; description: string | null };

export default function ProductionAreaForm({ productionArea }: { productionArea?: ProductionArea }) {
    const isEditing = !!productionArea;

    const { data, setData, post, put, errors, processing } = useForm({
        area_name: productionArea?.area_name ?? '',
        description: productionArea?.description ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(update.url(productionArea));
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Production Area' : 'New Production Area'} />

            <div className="p-6">
                <Heading
                    title={isEditing ? 'Edit Production Area' : 'New Production Area'}
                    description={
                        isEditing
                            ? 'Update this production area.'
                            : 'Add a new production area for categorizing machines.'
                    }
                />

                <form onSubmit={submit} className="mt-6 max-w-lg space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="area_name">Area Name</Label>
                        <Input
                            id="area_name"
                            value={data.area_name}
                            onChange={(e) => setData('area_name', e.target.value)}
                            placeholder="e.g. Weaving, Twisting"
                            required
                        />
                        <InputError message={errors.area_name} />
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

ProductionAreaForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Production Areas', href: index() },
        { title: 'Form', href: '#' },
    ],
};
