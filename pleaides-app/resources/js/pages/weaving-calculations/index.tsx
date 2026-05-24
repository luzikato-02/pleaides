import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Download, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { weavingCalculator } from '@/routes';
import { index, show } from '@/routes/weaving-calculations';

type Record = {
    id: number;
    calculated_at: string;
    shift_period: string | null;
    production_order: string | null;
    weaving_style: string | null;
    body_tension: string | null;
    twisting_length: string | null;
    total_rolls: string | null;
    total_roll_produced: string | null;
    total_warp_ends: string | null;
    plastic_tube_weight: string | null;
    standard_roll_length: string | null;
    adjustment_length: string | null;
    adjustment_length_2: string | null;
    total_roll_produced_2: string | null;
    adjustment_length_3: string | null;
    total_roll_produced_3: string | null;
    remarks: string | null;
    gpm_1: string | null;
    gpm_2: string | null;
    ao_sample_1: string | null;
    ao_sample_2: string | null;
    ai_sample_1: string | null;
    ai_sample_2: string | null;
    ai_sample_3: string | null;
    ai_sample_4: string | null;
    bi_sample_1: string | null;
    bi_sample_2: string | null;
    bi_sample_3: string | null;
    bi_sample_4: string | null;
    bo_sample_1: string | null;
    bo_sample_2: string | null;
    standard_creel_length_snapshot: string | null;
    quality_factor_snapshot: string | null;
    actual_length: string | null;
    actual_gpm: string | null;
    min_required_bobbin_weight: string | null;
    avg_bobbin_weight: string | null;
    waste_estimate_kg: string | null;
    standard_waste_kg: string | null;
    roll_status: string | null;
    waste_status: string | null;
    shift_group: { group_name: string } | null;
    machine: { machine_name: string; machine_code: string } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    machine_id?: string;
    roll_status?: string;
    waste_status?: string;
    date_from?: string;
    date_to?: string;
};

function n(v: string | null, decimals = 2) {
    if (v == null) return '—';
    const f = parseFloat(v);
    return isNaN(f) ? '—' : f.toFixed(decimals);
}

function Th({ children }: { children: React.ReactNode }) {
    return <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
    return <td className={`whitespace-nowrap px-3 py-2 text-xs ${className ?? ''}`}>{children}</td>;
}

function RollBadge({ status }: { status: string | null }) {
    if (status === 'sufficient')
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"><CheckCircle className="h-3 w-3" />Sufficient</span>;
    if (status === 'short')
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"><AlertTriangle className="h-3 w-3" />Short risk</span>;
    return <span className="text-xs text-muted-foreground">—</span>;
}

function WasteBadge({ status }: { status: string | null }) {
    if (status === 'within')
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"><TrendingDown className="h-3 w-3" />Within std</span>;
    if (status === 'excess')
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><TrendingUp className="h-3 w-3" />Excess</span>;
    return <span className="text-xs text-muted-foreground">—</span>;
}

export default function WeavingCalculationsIndex({
    records,
    machines,
    filters,
}: {
    records: Paginated<Record>;
    machines: { id: number; machine_name: string; machine_code: string }[];
    filters: Filters;
}) {
    const [local, setLocal] = useState<Filters>(filters);

    const apply = useCallback((next: Filters) => {
        setLocal(next);
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== '' && v != null),
        );
        router.get(index.url(), params, { preserveState: true, preserveScroll: true, replace: true });
    }, []);

    const hasFilters = Object.values(local).some((v) => v !== '' && v != null);

    return (
        <>
            <Head title="Calculation Records" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Calculation Records"
                        description={`${records.total} saved calculations`}
                    />
                    <div className="flex gap-2">
                        <a href={'/weaving-calculations/export?' + new URLSearchParams(
                            Object.fromEntries(Object.entries(local).filter(([, v]) => v !== '' && v != null)) as { [k: string]: string }
                        ).toString()}>
                            <Button variant="outline">
                                <Download className="mr-1.5 h-4 w-4" />
                                Export CSV
                            </Button>
                        </a>
                        <Link href={weavingCalculator()}>
                            <Button>New Calculation</Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-end gap-3">
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">Loom</p>
                        <Select
                            value={local.machine_id ?? ''}
                            onValueChange={(v) => apply({ ...local, machine_id: v || undefined })}
                        >
                            <SelectTrigger className="h-8 w-44 text-sm">
                                <SelectValue placeholder="All looms" />
                            </SelectTrigger>
                            <SelectContent>
                                {machines.map((m) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>
                                        {m.machine_name} ({m.machine_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">Roll Status</p>
                        <Select
                            value={local.roll_status ?? ''}
                            onValueChange={(v) => apply({ ...local, roll_status: v || undefined })}
                        >
                            <SelectTrigger className="h-8 w-36 text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sufficient">Sufficient</SelectItem>
                                <SelectItem value="short">Short risk</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">Waste Status</p>
                        <Select
                            value={local.waste_status ?? ''}
                            onValueChange={(v) => apply({ ...local, waste_status: v || undefined })}
                        >
                            <SelectTrigger className="h-8 w-36 text-sm">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="within">Within standard</SelectItem>
                                <SelectItem value="excess">Excess waste</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">From</p>
                        <Input
                            type="date"
                            value={local.date_from ?? ''}
                            onChange={(e) => apply({ ...local, date_from: e.target.value || undefined })}
                            className="h-8 w-36 text-sm"
                        />
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">To</p>
                        <Input
                            type="date"
                            value={local.date_to ?? ''}
                            onChange={(e) => apply({ ...local, date_to: e.target.value || undefined })}
                            className="h-8 w-36 text-sm"
                        />
                    </div>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => apply({})}
                        >
                            <X className="mr-1 h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>

                {records.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No calculations found.{' '}
                        {!hasFilters && (
                            <Link href={weavingCalculator()} className="underline">
                                Run the first one.
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        {/* Job info */}
                                        <Th>Date / Time</Th>
                                        <Th>Loom</Th>
                                        <Th>Shift Group</Th>
                                        <Th>Period</Th>
                                        <Th>Production Order</Th>
                                        <Th>Weaving Style</Th>
                                        <Th>Body Tension</Th>
                                        <Th>Twisting Len (m)</Th>
                                        {/* Creel params */}
                                        <Th>Total Rolls</Th>
                                        <Th>Roll Produced</Th>
                                        <Th>Warp Ends</Th>
                                        <Th>Tube Wt (g)</Th>
                                        <Th>Std Roll Len (m)</Th>
                                        <Th>Adjustment (m)</Th>
                                        <Th>Adj 2 (m)</Th>
                                        <Th>Rolls 2</Th>
                                        <Th>Adj 3 (m)</Th>
                                        <Th>Rolls 3</Th>
                                        <Th>G/m 1</Th>
                                        <Th>G/m 2</Th>
                                        {/* Samples */}
                                        <Th>AO1 (g)</Th>
                                        <Th>AO2 (g)</Th>
                                        <Th>AI1 (g)</Th>
                                        <Th>AI2 (g)</Th>
                                        <Th>AI3 (g)</Th>
                                        <Th>AI4 (g)</Th>
                                        <Th>BI1 (g)</Th>
                                        <Th>BI2 (g)</Th>
                                        <Th>BI3 (g)</Th>
                                        <Th>BI4 (g)</Th>
                                        <Th>BO1 (g)</Th>
                                        <Th>BO2 (g)</Th>
                                        {/* Snapshots */}
                                        <Th>Std Creel Len</Th>
                                        <Th>Quality Factor</Th>
                                        {/* Results */}
                                        <Th>Actual Len (m)</Th>
                                        <Th>Actual G/m</Th>
                                        <Th>Min Bobbin (g)</Th>
                                        <Th>Avg Bobbin (g)</Th>
                                        <Th>Waste Est. (kg)</Th>
                                        <Th>Std Waste (kg)</Th>
                                        <Th>Roll</Th>
                                        <Th>Waste</Th>
                                        <Th>Remarks</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-t cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => router.visit(show.url(r.id))}
                                        >
                                            {/* Job info */}
                                            <Td className="text-muted-foreground">{new Date(r.calculated_at).toLocaleString()}</Td>
                                            <Td>
                                                {r.machine
                                                    ? <><span className="font-medium">{r.machine.machine_name}</span><span className="ml-1 font-mono text-muted-foreground">({r.machine.machine_code})</span></>
                                                    : '—'}
                                            </Td>
                                            <Td className="text-muted-foreground">{r.shift_group?.group_name ?? '—'}</Td>
                                            <Td className="text-muted-foreground">{r.shift_period ?? '—'}</Td>
                                            <Td className="text-muted-foreground">{r.production_order ?? '—'}</Td>
                                            <Td className="text-muted-foreground">{r.weaving_style ?? '—'}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.body_tension, 3)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.twisting_length, 2)}</Td>
                                            {/* Creel params */}
                                            <Td className="tabular-nums text-muted-foreground">{n(r.total_rolls, 0)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.total_roll_produced, 0)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.total_warp_ends, 0)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.plastic_tube_weight, 3)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.standard_roll_length, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.adjustment_length, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.adjustment_length_2, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.total_roll_produced_2, 0)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.adjustment_length_3, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.total_roll_produced_3, 0)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.gpm_1, 3)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.gpm_2, 3)}</Td>
                                            {/* Samples */}
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ao_sample_1, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ao_sample_2, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ai_sample_1, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ai_sample_2, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ai_sample_3, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.ai_sample_4, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bi_sample_1, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bi_sample_2, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bi_sample_3, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bi_sample_4, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bo_sample_1, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.bo_sample_2, 2)}</Td>
                                            {/* Snapshots */}
                                            <Td className="tabular-nums text-muted-foreground">{n(r.standard_creel_length_snapshot, 3)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.quality_factor_snapshot, 4)}</Td>
                                            {/* Results */}
                                            <Td className="tabular-nums text-muted-foreground">{n(r.actual_length, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.actual_gpm, 3)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.min_required_bobbin_weight, 2)}</Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.avg_bobbin_weight, 2)}</Td>
                                            <Td className="tabular-nums">
                                                {r.waste_estimate_kg != null
                                                    ? <span className={
                                                        r.standard_waste_kg == null ? '' :
                                                        parseFloat(r.waste_estimate_kg) > parseFloat(r.standard_waste_kg) ? 'text-red-600 dark:text-red-400' :
                                                        parseFloat(r.waste_estimate_kg) < parseFloat(r.standard_waste_kg) ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-green-600 dark:text-green-400'
                                                      }>
                                                        {parseFloat(r.waste_estimate_kg).toFixed(3)}
                                                      </span>
                                                    : '—'}
                                            </Td>
                                            <Td className="tabular-nums text-muted-foreground">{n(r.standard_waste_kg, 3)}</Td>
                                            <Td><RollBadge status={r.roll_status} /></Td>
                                            <Td><WasteBadge status={r.waste_status} /></Td>
                                            <Td className="max-w-[200px] truncate text-muted-foreground">{r.remarks ?? '—'}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {records.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <p className="text-muted-foreground">
                                    Page {records.current_page} of {records.last_page} · {records.total} records
                                </p>
                                <div className="flex gap-2">
                                    {records.prev_page_url && (
                                        <Link href={records.prev_page_url}>
                                            <Button variant="outline" size="sm">Previous</Button>
                                        </Link>
                                    )}
                                    {records.next_page_url && (
                                        <Link href={records.next_page_url}>
                                            <Button variant="outline" size="sm">Next</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

WeavingCalculationsIndex.layout = {
    breadcrumbs: [
        { title: 'Weaving Dashboard', href: '/weaving-dashboard' },
        { title: 'Calculation Records', href: '/weaving-calculations' },
    ],
};
