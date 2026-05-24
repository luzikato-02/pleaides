import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Circle, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { update, show } from '@/routes/weaving-calculations';

type ShiftGroup = { id: number; group_name: string };
type WeavingMachine = {
    id: number;
    machine_name: string;
    machine_code: string;
    standard_creel_length: number | null;
    quality_factor: number | null;
    tolerance_kg: number | null;
};
type TubeType = { id: number; tube_name: string; basic_weight: string };

type CalculationRecord = {
    id: number;
    shift_group_id: number | null;
    shift_period: string | null;
    production_order: string | null;
    machine_id: number | null;
    weaving_style: string | null;
    body_tension: string | null;
    twisting_length: string | null;
    total_rolls: string | null;
    total_roll_produced: string | null;
    total_warp_ends: string | null;
    tube_type_id: number | null;
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
    roll_status: string | null;
    waste_status: string | null;
};

function F({
    label,
    value,
    onChange,
    placeholder,
    allowNegative,
    readOnly,
    className,
}: {
    label: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    allowNegative?: boolean;
    readOnly?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <Label className="mb-0.5 block text-xs text-muted-foreground">{label}</Label>
            <Input
                type="number"
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                placeholder={readOnly ? '' : (placeholder ?? '0')}
                step="any"
                min={allowNegative ? undefined : '0'}
                readOnly={readOnly}
                className={`h-8 text-sm ${readOnly ? 'bg-muted/40 text-muted-foreground' : ''}`}
            />
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

const POSITIONS = [
    { key: 'ao', label: 'AO', sub: 'Outer A', count: 2, ring: 'border-blue-300 dark:border-blue-700',   bg: 'bg-blue-50/60 dark:bg-blue-950/20',   hdr: 'text-blue-600 dark:text-blue-400' },
    { key: 'ai', label: 'AI', sub: 'Inner A', count: 4, ring: 'border-green-300 dark:border-green-700', bg: 'bg-green-50/60 dark:bg-green-950/20', hdr: 'text-green-600 dark:text-green-400' },
    { key: 'bi', label: 'BI', sub: 'Inner B', count: 4, ring: 'border-purple-300 dark:border-purple-700',bg: 'bg-purple-50/60 dark:bg-purple-950/20',hdr: 'text-purple-600 dark:text-purple-400' },
    { key: 'bo', label: 'BO', sub: 'Outer B', count: 2, ring: 'border-rose-300 dark:border-rose-700',   bg: 'bg-rose-50/60 dark:bg-rose-950/20',   hdr: 'text-rose-600 dark:text-rose-400' },
] as const;

function str(v: string | number | null | undefined) {
    return v == null ? '' : String(v);
}

export default function WeavingCalculationEdit({
    record,
    shiftGroups,
    weavingMachines,
    tubeTypes,
}: {
    record: CalculationRecord;
    shiftGroups: ShiftGroup[];
    weavingMachines: WeavingMachine[];
    tubeTypes: TubeType[];
}) {
    // Job info
    const [shiftGroup, setShiftGroup]   = useState(str(record.shift_group_id));
    const [shiftPeriod, setShiftPeriod] = useState(str(record.shift_period));
    const [productionOrder, setPO]      = useState(str(record.production_order));
    const [loomNumber, setLoom]         = useState(str(record.machine_id));
    const [weavingStyle, setStyle]      = useState(str(record.weaving_style));
    const [bodyTension, setBodyTension] = useState(str(record.body_tension));
    const [twistingLength, setTwisting] = useState(str(record.twisting_length));

    // Creel params
    const [totalRolls, setRolls]      = useState(str(record.total_rolls));
    const [totalProduced, setProduced]= useState(str(record.total_roll_produced));
    const [warpEnds, setWarpEnds]     = useState(str(record.total_warp_ends));
    const [tubeTypeId, setTubeTypeId] = useState(str(record.tube_type_id));
    const [stdRollLen, setStdLen]     = useState(str(record.standard_roll_length));
    const [adjLen, setAdj]            = useState(str(record.adjustment_length));
    const [adj2, setAdj2]           = useState(str(record.adjustment_length_2));
    const [produced2, setProduced2] = useState(str(record.total_roll_produced_2));
    const [adj3, setAdj3]           = useState(str(record.adjustment_length_3));
    const [produced3, setProduced3] = useState(str(record.total_roll_produced_3));
    const [remarks, setRemarks]     = useState(str(record.remarks));
    const [gpm1, setGpm1]             = useState(str(record.gpm_1));
    const [gpm2, setGpm2]             = useState(str(record.gpm_2));

    // Samples
    const [samples, setSamples] = useState<Record<string, string[]>>({
        ao: [str(record.ao_sample_1), str(record.ao_sample_2)],
        ai: [str(record.ai_sample_1), str(record.ai_sample_2), str(record.ai_sample_3), str(record.ai_sample_4)],
        bi: [str(record.bi_sample_1), str(record.bi_sample_2), str(record.bi_sample_3), str(record.bi_sample_4)],
        bo: [str(record.bo_sample_1), str(record.bo_sample_2)],
    });

    const setS = (pos: string, i: number, v: string) =>
        setSamples((p) => { const a = [...p[pos]]; a[i] = v; return { ...p, [pos]: a }; });

    const machine = useMemo(
        () => weavingMachines.find((m) => m.id.toString() === loomNumber) ?? null,
        [loomNumber, weavingMachines],
    );

    const selectedTube = useMemo(
        () => tubeTypes.find((t) => t.id.toString() === tubeTypeId) ?? null,
        [tubeTypeId, tubeTypes],
    );

    const { actualLen, actualGpm, minReq, avgWeight, wasteEst, stdWaste, adjustmentSuggestion, withinTolerance, hasSamples } = useMemo(() => {
        const actualLen   = (parseFloat(stdRollLen) || 0) + (parseFloat(adjLen) || 0);
        const actualGpm   = ((parseFloat(gpm1) || 0) + (parseFloat(gpm2) || 0)) / 2;
        const we          = parseFloat(warpEnds) || 0;
        const tubeWeight  = selectedTube ? parseFloat(selectedTube.basic_weight) : 0;
        const remainRolls = (parseFloat(totalRolls) || 0) - (parseFloat(totalProduced) || 0);
        const minReq      = we > 0
            ? remainRolls * actualLen / we * actualGpm + tubeWeight
            : 0;

        const hasSamples  = Object.values(samples).flat().some((s) => s.trim() !== '');
        const nums        = Object.values(samples).flat().map(parseFloat).filter((v) => !isNaN(v));
        const avgWeight   = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        const creelStdLen = machine?.standard_creel_length ?? 0;
        const wasteEst    = hasSamples && we > 0
            ? (((avgWeight - minReq) * we) + creelStdLen * actualGpm) / 1000
            : null;

        const stdWaste =
            machine?.standard_creel_length != null && machine?.quality_factor != null && actualGpm > 0
                ? (actualGpm * machine.standard_creel_length * machine.quality_factor) / 1000
                : null;

        const rawAdj = wasteEst !== null && stdWaste !== null && actualGpm > 0 && remainRolls > 0
            ? (wasteEst - stdWaste) / actualGpm * 1000 / remainRolls
            : null;
        const adjustmentSuggestion = rawAdj !== null
            ? (rawAdj >= 0 ? 1 : -1) * Math.ceil(Math.abs(rawAdj) / 5) * 5
            : null;

        const toleranceKg = machine?.tolerance_kg ?? null;
        const withinTolerance = toleranceKg !== null && wasteEst !== null && stdWaste !== null
            && Math.abs(wasteEst - stdWaste) < toleranceKg;

        return { actualLen, actualGpm, minReq, avgWeight, wasteEst, stdWaste, adjustmentSuggestion, withinTolerance, hasSamples };
    }, [stdRollLen, adjLen, gpm1, gpm2, totalRolls, totalProduced, warpEnds, selectedTube, samples, machine]);

    const rollStatus  = !hasSamples || wasteEst === null ? 'pending' : wasteEst >= 0 ? 'ok' : 'short';
    const wasteStatus = wasteEst === null || stdWaste === null ? 'none' : wasteEst <= stdWaste ? 'within' : 'excess';

    const [saving, setSaving] = useState(false);

    const handleUpdate = () => {
        setSaving(true);
        router.put(update.url(record.id), {
            shift_group_id:   shiftGroup  || null,
            shift_period:     shiftPeriod || null,
            production_order: productionOrder || null,
            machine_id:       loomNumber  || null,
            tube_type_id:     tubeTypeId  || null,
            weaving_style:    weavingStyle || null,
            body_tension:     bodyTension || null,
            twisting_length:  twistingLength || null,
            total_rolls:           totalRolls   || null,
            total_roll_produced:   totalProduced || null,
            total_warp_ends:       warpEnds     || null,
            plastic_tube_weight:   selectedTube ? parseFloat(selectedTube.basic_weight) : null,
            standard_roll_length:  stdRollLen   || null,
            adjustment_length:     adjLen       || null,
            adjustment_length_2:   adj2 || null,
            total_roll_produced_2: produced2 || null,
            adjustment_length_3:   adj3 || null,
            total_roll_produced_3: produced3 || null,
            remarks: remarks || null,
            gpm_1: gpm1 || null,
            gpm_2: gpm2 || null,
            ao_sample_1: samples.ao[0] || null, ao_sample_2: samples.ao[1] || null,
            ai_sample_1: samples.ai[0] || null, ai_sample_2: samples.ai[1] || null,
            ai_sample_3: samples.ai[2] || null, ai_sample_4: samples.ai[3] || null,
            bi_sample_1: samples.bi[0] || null, bi_sample_2: samples.bi[1] || null,
            bi_sample_3: samples.bi[2] || null, bi_sample_4: samples.bi[3] || null,
            bo_sample_1: samples.bo[0] || null, bo_sample_2: samples.bo[1] || null,
            standard_creel_length_snapshot: machine?.standard_creel_length ?? (record.standard_creel_length_snapshot ? parseFloat(record.standard_creel_length_snapshot) : null),
            quality_factor_snapshot:        machine?.quality_factor ?? (record.quality_factor_snapshot ? parseFloat(record.quality_factor_snapshot) : null),
            tolerance_kg_snapshot:          machine?.tolerance_kg ?? (record.tolerance_kg_snapshot ? parseFloat(record.tolerance_kg_snapshot) : null),
            actual_length:               actualLen,
            actual_gpm:                  actualGpm,
            min_required_bobbin_weight:  minReq,
            avg_bobbin_weight:           hasSamples ? avgWeight : null,
            waste_estimate_kg:           wasteEst,
            standard_waste_kg:           stdWaste,
            roll_status:  rollStatus === 'ok' ? 'sufficient' : rollStatus === 'short' ? 'short' : 'pending',
            waste_status: wasteStatus === 'none' ? 'no-data' : wasteStatus,
        }, { onFinish: () => setSaving(false) });
    };

    return (
        <>
            <Head title={`Edit Calculation #${record.id}`} />

            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Edit Calculation #{record.id}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.visit(show.url(record.id))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={saving} size="sm">
                            <Save className="mr-1.5 h-4 w-4" />
                            {saving ? 'Saving…' : 'Update'}
                        </Button>
                    </div>
                </div>

                {/* Row 1 — Job Information | Results */}
                <div className="grid gap-3 lg:grid-cols-2">

                    {/* Card 1 — Job Information */}
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-sm font-medium">Job Information</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="mb-0.5 block text-xs text-muted-foreground">Shift Group</Label>
                                    <Select value={shiftGroup} onValueChange={setShiftGroup}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shiftGroups.map((g) => (
                                                <SelectItem key={g.id} value={g.id.toString()}>{g.group_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-0.5 block text-xs text-muted-foreground">Shift Period</Label>
                                    <Select value={shiftPeriod} onValueChange={setShiftPeriod}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['1', '3', '4'].map((p) => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-0.5 block text-xs text-muted-foreground">Loom</Label>
                                    <Select value={loomNumber} onValueChange={setLoom}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Select loom" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {weavingMachines.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.machine_name} ({m.machine_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-0.5 block text-xs text-muted-foreground">Production Order</Label>
                                    <Input className="h-8 text-sm" value={productionOrder} onChange={(e) => setPO(e.target.value)} placeholder="PO-…" />
                                </div>

                                <div>
                                    <Label className="mb-0.5 block text-xs text-muted-foreground">Weaving Style</Label>
                                    <Input className="h-8 text-sm" value={weavingStyle} onChange={(e) => setStyle(e.target.value)} placeholder="Plain, Twill…" />
                                </div>

                                <F label="Body Tension" value={bodyTension} onChange={setBodyTension} placeholder="0" />

                                <F label="Twisting Length (m)" value={twistingLength} onChange={setTwisting} placeholder="m" />
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
                                {rollStatus === 'pending' && (
                                    <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-muted-foreground">
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeDasharray="4 2" />
                                        <div>
                                            <p className="text-sm font-medium">Awaiting samples</p>
                                            <p className="text-xs">Enter bobbin weight samples to see roll status.</p>
                                        </div>
                                    </div>
                                )}
                                {rollStatus === 'ok' && wasteEst !== null && (
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

                                {wasteStatus === 'none' && (
                                    <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-muted-foreground">
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0" strokeDasharray="4 2" />
                                        <div>
                                            <p className="text-sm font-medium">Standard indicator unavailable</p>
                                            <p className="text-xs">Select a loom with a configured standard and enter samples.</p>
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
                        {/* Card 2 — Creel Parameters */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Creel Parameters</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <F label="Total Rolls"         value={totalRolls}    onChange={setRolls}    />
                                    <F label="Total Roll Produced" value={totalProduced}  onChange={setProduced} />
                                    <F label="Total Warp Ends"     value={warpEnds}       onChange={setWarpEnds} />
                                    <div>
                                        <Label className="mb-0.5 block text-xs text-muted-foreground">Tube Type</Label>
                                        <Select value={tubeTypeId} onValueChange={setTubeTypeId}>
                                            <SelectTrigger className="h-8 text-sm">
                                                <SelectValue placeholder="Select tube" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tubeTypes.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.tube_name} ({parseFloat(t.basic_weight).toFixed(1)} g)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">Actual Length</p>
                                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-1">
                                        <F label="Std Roll Length (m)" value={stdRollLen} onChange={setStdLen} />
                                        <span className="mb-1.5 px-0.5 text-sm text-muted-foreground">±</span>
                                        <F label="Adjustment (m)" value={adjLen} onChange={setAdj} allowNegative />
                                        <span className="mb-1.5 px-0.5 text-sm text-muted-foreground">=</span>
                                        <F label="Actual Length (m)" value={actualLen.toFixed(2)} readOnly />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">Actual G/m</p>
                                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-1">
                                        <F label="G/m Measurement 1" value={gpm1} onChange={setGpm1} />
                                        <span className="mb-1.5 px-0.5 text-sm text-muted-foreground">+</span>
                                        <F label="G/m Measurement 2" value={gpm2} onChange={setGpm2} />
                                        <span className="mb-1.5 px-0.5 text-sm text-muted-foreground">÷2=</span>
                                        <F label="Actual G/m" value={actualGpm.toFixed(3)} readOnly />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <F label="Min Bobbin Wt (g)" value={minReq.toFixed(2)} readOnly />
                                    <F label="Avg Bobbin Wt (g)" value={hasSamples ? avgWeight.toFixed(2) : ''} readOnly />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3 — Length Adjustments */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Length Adjustments</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-3 border-b pb-2">
                                    <p className="text-xs font-medium text-muted-foreground">Adjustment (m)</p>
                                    <p className="text-xs font-medium text-muted-foreground">Roll Produced</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="number" step="any" value={adjLen} readOnly className="h-8 text-sm bg-muted/40 text-muted-foreground" />
                                    <Input type="number" step="any" value={totalProduced} readOnly className="h-8 text-sm bg-muted/40 text-muted-foreground" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="number" step="any" value={adj2} onChange={(e) => setAdj2(e.target.value)} placeholder="0" className="h-8 text-sm" />
                                    <Input type="number" step="any" min="0" value={produced2} onChange={(e) => setProduced2(e.target.value)} placeholder="0" className="h-8 text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="number" step="any" value={adj3} onChange={(e) => setAdj3(e.target.value)} placeholder="0" className="h-8 text-sm" />
                                    <Input type="number" step="any" min="0" value={produced3} onChange={(e) => setProduced3(e.target.value)} placeholder="0" className="h-8 text-sm" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Card 4 — Bobbin Weight Samples */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Bobbin Weight Samples</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                <div className="grid grid-cols-2 gap-2">
                                    {POSITIONS.map((pos) => (
                                        <div key={pos.key} className={`rounded-md border p-2.5 ${pos.ring} ${pos.bg}`}>
                                            <p className="mb-1.5 text-xs font-semibold">
                                                <span className={pos.hdr}>{pos.label}</span>
                                                <span className="ml-1 font-normal text-muted-foreground">{pos.sub}</span>
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                {samples[pos.key].map((val, i) => (
                                                    <Input
                                                        key={i}
                                                        type="number"
                                                        value={val}
                                                        onChange={(e) => setS(pos.key, i, e.target.value)}
                                                        placeholder={`Sample ${i + 1} (g)`}
                                                        step="any"
                                                        min="0"
                                                        className="h-7 text-xs"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 5 — Remarks */}
                        <Card>
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-sm font-medium">Remarks</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any notes or remarks…"
                                    rows={4}
                                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

WeavingCalculationEdit.layout = {
    breadcrumbs: [
        { title: 'Weaving Dashboard', href: '/weaving-dashboard' },
        { title: 'Calculation Records', href: '/weaving-calculations' },
        { title: 'Edit', href: '#' },
    ],
};
