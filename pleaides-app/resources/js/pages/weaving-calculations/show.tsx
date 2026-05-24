import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, Circle, Pencil, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { edit, index } from '@/routes/weaving-calculations';

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
    tolerance_kg_snapshot: string | null;
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

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium tabular-nums">{value ?? '—'}</p>
        </div>
    );
}

function Tile({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: 'green' | 'red' | 'amber' }) {
    const bg =
        color === 'green' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' :
        color === 'red'   ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' :
        color === 'amber' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' :
        'bg-muted/30';
    return (
        <div className={`rounded-lg border px-3 py-2 ${bg}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-semibold tabular-nums">
                {value}
                {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
            </p>
        </div>
    );
}

function fmt(v: string | null, decimals = 3) {
    if (v == null) return '—';
    const n = parseFloat(v);
    return isNaN(n) ? '—' : n.toFixed(decimals);
}

export default function WeavingCalculationShow({ record }: { record: Record }) {
    const wasteEst    = record.waste_estimate_kg != null ? parseFloat(record.waste_estimate_kg) : null;
    const stdWaste    = record.standard_waste_kg != null ? parseFloat(record.standard_waste_kg) : null;
    const actualGpm   = record.actual_gpm != null ? parseFloat(record.actual_gpm) : null;
    const remainRolls = (record.total_rolls != null ? parseFloat(record.total_rolls) : 0)
                      - (record.total_roll_produced != null ? parseFloat(record.total_roll_produced) : 0);

    const rawAdj = wasteEst !== null && stdWaste !== null && actualGpm !== null && actualGpm > 0 && remainRolls > 0
        ? (wasteEst - stdWaste) / actualGpm * 1000 / remainRolls
        : null;
    const adjustmentSuggestion = rawAdj !== null
        ? (rawAdj >= 0 ? 1 : -1) * Math.ceil(Math.abs(rawAdj) / 5) * 5
        : null;

    const toleranceKg = record.tolerance_kg_snapshot != null ? parseFloat(record.tolerance_kg_snapshot) : null;
    const withinTolerance = toleranceKg !== null && wasteEst !== null && stdWaste !== null
        && Math.abs(wasteEst - stdWaste) < toleranceKg;

    const rollStatus  = record.roll_status;
    const wasteStatus = record.waste_status;

    return (
        <>
            <Head title={`Calculation #${record.id}`} />

            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                    <Link href={index()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" />
                        Calculation Records
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Calculation #{record.id}</h1>
                        <p className="text-sm text-muted-foreground">
                            {new Date(record.calculated_at).toLocaleString()}
                        </p>
                    </div>
                    <Button size="sm" onClick={() => router.visit(edit.url(record.id))}>
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Edit
                    </Button>
                </div>

                {/* Row 1 — Job Information | Results */}
                <div className="grid gap-3 lg:grid-cols-2">

                    {/* Card 1 — Job Information */}
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-sm font-medium">Job Information</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Shift Group"      value={record.shift_group?.group_name} />
                                <Field label="Shift Period"     value={record.shift_period} />
                                <Field label="Loom"             value={record.machine ? `${record.machine.machine_name} (${record.machine.machine_code})` : null} />
                                <Field label="Production Order" value={record.production_order} />
                                <Field label="Weaving Style"    value={record.weaving_style} />
                                <Field label="Body Tension"     value={record.body_tension != null ? fmt(record.body_tension, 3) : null} />
                                <Field label="Twisting Length"  value={record.twisting_length != null ? `${fmt(record.twisting_length, 2)} m` : null} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card — Results */}
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-sm font-medium">Results</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
                            <div className="grid grid-cols-3 gap-2">
                                <Tile
                                    label="Waste Estimate"
                                    value={wasteEst !== null ? wasteEst.toFixed(3) : '—'}
                                    unit={wasteEst !== null ? 'kg' : undefined}
                                    color={wasteEst === null || stdWaste === null ? undefined : wasteEst > stdWaste ? 'red' : wasteEst < stdWaste ? 'amber' : 'green'}
                                />
                                <Tile label="Standard Waste" value={stdWaste !== null ? stdWaste.toFixed(3) : '—'} unit={stdWaste !== null ? 'kg' : undefined} />
                                <Tile
                                    label="Weaving Adj. Suggestion"
                                    value={withinTolerance ? '0' : adjustmentSuggestion !== null ? (adjustmentSuggestion > 0 ? '+' : '') + adjustmentSuggestion.toFixed(0) : '—'}
                                    unit={withinTolerance || adjustmentSuggestion !== null ? 'm' : undefined}
                                    color={withinTolerance ? undefined : adjustmentSuggestion === null ? undefined : adjustmentSuggestion > 0 ? 'green' : adjustmentSuggestion < 0 ? 'red' : undefined}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                {(rollStatus === 'pending' || rollStatus == null) && (
                                    <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-muted-foreground">
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeDasharray="4 2" />
                                        <div>
                                            <p className="text-sm font-medium">Awaiting samples</p>
                                            <p className="text-xs">No bobbin weight samples were provided.</p>
                                        </div>
                                    </div>
                                )}
                                {rollStatus === 'sufficient' && wasteEst !== null && (
                                    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Bobbin weight sufficient</p>
                                            <p className="text-xs">Surplus of {wasteEst.toFixed(3)} kg. Full roll expected.</p>
                                        </div>
                                    </div>
                                )}
                                {rollStatus === 'short' && wasteEst !== null && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Short roll risk</p>
                                            <p className="text-xs">Deficit of {wasteEst.toFixed(3)} kg. May not reach full length.</p>
                                        </div>
                                    </div>
                                )}

                                {(wasteStatus === 'no-data' || wasteStatus == null) && (
                                    <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-muted-foreground">
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeDasharray="4 2" />
                                        <div>
                                            <p className="text-sm font-medium">Standard indicator unavailable</p>
                                            <p className="text-xs">No machine standard or sample data at time of calculation.</p>
                                        </div>
                                    </div>
                                )}
                                {wasteStatus === 'within' && wasteEst !== null && stdWaste !== null && (
                                    <div className="flex items-start gap-2 rounded-lg border p-3 text-muted-foreground">
                                        <TrendingDown className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Waste below standard</p>
                                            <p className="text-xs">{wasteEst.toFixed(3)} kg vs standard {stdWaste.toFixed(3)} kg.</p>
                                        </div>
                                    </div>
                                )}
                                {wasteStatus === 'excess' && wasteEst !== null && stdWaste !== null && (
                                    <div className="flex items-start gap-2 rounded-lg border p-3 text-muted-foreground">
                                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Waste above standard</p>
                                            <p className="text-xs">{wasteEst.toFixed(3)} kg exceeds standard {stdWaste.toFixed(3)} kg by {(wasteEst - stdWaste).toFixed(3)} kg.</p>
                                        </div>
                                    </div>
                                )}
                                {withinTolerance && (
                                    <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-muted-foreground">
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeDasharray="4 2" />
                                        <div>
                                            <p className="text-sm font-medium">No adjustment needed</p>
                                            <p className="text-xs">The gap between waste estimate and standard is within tolerance.</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2 — Creel Parameters + Length Adjustments | Bobbin Weight Samples + Remarks */}
                <div className="grid gap-3 lg:grid-cols-2">

                    <div className="flex flex-col gap-3">
                        {/* Card — Creel Parameters */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Creel Parameters</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Total Rolls"          value={fmt(record.total_rolls, 0)} />
                                    <Field label="Total Roll Produced"  value={fmt(record.total_roll_produced, 0)} />
                                    <Field label="Total Warp Ends"      value={fmt(record.total_warp_ends, 0)} />
                                    <Field label="Plastic Tube Weight"  value={record.plastic_tube_weight != null ? `${fmt(record.plastic_tube_weight, 3)} g` : null} />
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Actual Length</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Field label="Std Roll Length" value={record.standard_roll_length != null ? `${fmt(record.standard_roll_length, 2)} m` : null} />
                                        <Field label="Adjustment"      value={record.adjustment_length != null ? `${fmt(record.adjustment_length, 2)} m` : null} />
                                        <Field label="Actual Length"   value={record.actual_length != null ? `${fmt(record.actual_length, 2)} m` : null} />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Actual G/m</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Field label="G/m Measurement 1" value={record.gpm_1 != null ? `${fmt(record.gpm_1, 3)} g/m` : null} />
                                        <Field label="G/m Measurement 2" value={record.gpm_2 != null ? `${fmt(record.gpm_2, 3)} g/m` : null} />
                                        <Field label="Actual G/m"        value={record.actual_gpm != null ? `${fmt(record.actual_gpm, 3)} g/m` : null} />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Machine Standard (at time of calculation)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Std Creel Length" value={record.standard_creel_length_snapshot != null ? `${fmt(record.standard_creel_length_snapshot, 3)} m` : null} />
                                        <Field label="Quality Factor"   value={record.quality_factor_snapshot != null ? fmt(record.quality_factor_snapshot, 4) : null} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Min Bobbin Wt (g)" value={record.min_required_bobbin_weight != null ? fmt(record.min_required_bobbin_weight, 2) : null} />
                                    <Field label="Avg Bobbin Wt (g)" value={record.avg_bobbin_weight != null ? fmt(record.avg_bobbin_weight, 2) : null} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card — Length Adjustments */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Length Adjustments</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-4 border-b pb-2">
                                    <p className="text-xs font-medium text-muted-foreground">Adjustment (m)</p>
                                    <p className="text-xs font-medium text-muted-foreground">Roll Produced</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Event 1" value={record.adjustment_length != null ? `${fmt(record.adjustment_length, 2)} m` : null} />
                                    <Field label="Event 1" value={fmt(record.total_roll_produced, 0)} />
                                </div>
                                {(record.adjustment_length_2 != null || record.total_roll_produced_2 != null) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Event 2" value={record.adjustment_length_2 != null ? `${fmt(record.adjustment_length_2, 2)} m` : null} />
                                        <Field label="Event 2" value={fmt(record.total_roll_produced_2, 0)} />
                                    </div>
                                )}
                                {(record.adjustment_length_3 != null || record.total_roll_produced_3 != null) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Event 3" value={record.adjustment_length_3 != null ? `${fmt(record.adjustment_length_3, 2)} m` : null} />
                                        <Field label="Event 3" value={fmt(record.total_roll_produced_3, 0)} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Card — Bobbin Weight Samples */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Bobbin Weight Samples</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-md border border-blue-300 bg-blue-50/60 p-3 dark:border-blue-700 dark:bg-blue-950/20">
                                        <p className="mb-2 text-xs font-semibold">
                                            <span className="text-blue-600 dark:text-blue-400">AO</span>
                                            <span className="ml-1 font-normal text-muted-foreground">Outer A</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Sample 1" value={record.ao_sample_1 != null ? `${fmt(record.ao_sample_1, 2)} g` : null} />
                                            <Field label="Sample 2" value={record.ao_sample_2 != null ? `${fmt(record.ao_sample_2, 2)} g` : null} />
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-green-300 bg-green-50/60 p-3 dark:border-green-700 dark:bg-green-950/20">
                                        <p className="mb-2 text-xs font-semibold">
                                            <span className="text-green-600 dark:text-green-400">AI</span>
                                            <span className="ml-1 font-normal text-muted-foreground">Inner A</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Sample 1" value={record.ai_sample_1 != null ? `${fmt(record.ai_sample_1, 2)} g` : null} />
                                            <Field label="Sample 2" value={record.ai_sample_2 != null ? `${fmt(record.ai_sample_2, 2)} g` : null} />
                                            <Field label="Sample 3" value={record.ai_sample_3 != null ? `${fmt(record.ai_sample_3, 2)} g` : null} />
                                            <Field label="Sample 4" value={record.ai_sample_4 != null ? `${fmt(record.ai_sample_4, 2)} g` : null} />
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-purple-300 bg-purple-50/60 p-3 dark:border-purple-700 dark:bg-purple-950/20">
                                        <p className="mb-2 text-xs font-semibold">
                                            <span className="text-purple-600 dark:text-purple-400">BI</span>
                                            <span className="ml-1 font-normal text-muted-foreground">Inner B</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Sample 1" value={record.bi_sample_1 != null ? `${fmt(record.bi_sample_1, 2)} g` : null} />
                                            <Field label="Sample 2" value={record.bi_sample_2 != null ? `${fmt(record.bi_sample_2, 2)} g` : null} />
                                            <Field label="Sample 3" value={record.bi_sample_3 != null ? `${fmt(record.bi_sample_3, 2)} g` : null} />
                                            <Field label="Sample 4" value={record.bi_sample_4 != null ? `${fmt(record.bi_sample_4, 2)} g` : null} />
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-rose-300 bg-rose-50/60 p-3 dark:border-rose-700 dark:bg-rose-950/20">
                                        <p className="mb-2 text-xs font-semibold">
                                            <span className="text-rose-600 dark:text-rose-400">BO</span>
                                            <span className="ml-1 font-normal text-muted-foreground">Outer B</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Sample 1" value={record.bo_sample_1 != null ? `${fmt(record.bo_sample_1, 2)} g` : null} />
                                            <Field label="Sample 2" value={record.bo_sample_2 != null ? `${fmt(record.bo_sample_2, 2)} g` : null} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card — Remarks */}
                        {record.remarks && (
                            <Card>
                                <CardHeader className="px-4 py-3">
                                    <CardTitle className="text-sm font-medium">Remarks</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 pt-0">
                                    <p className="whitespace-pre-wrap text-sm">{record.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

WeavingCalculationShow.layout = {
    breadcrumbs: [
        { title: 'Weaving Dashboard', href: '/weaving-dashboard' },
        { title: 'Calculation Records', href: '/weaving-calculations' },
        { title: 'Detail', href: '#' },
    ],
};
