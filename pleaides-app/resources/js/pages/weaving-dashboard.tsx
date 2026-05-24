import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Calculator, CheckCircle, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { weavingCalculator } from '@/routes';
import { index as recordsIndex } from '@/routes/weaving-calculations';

type Counts = {
    total: number;
    today: number;
    this_week: number;
    roll_sufficient: number;
    roll_short: number;
    waste_within: number;
    waste_excess: number;
};

type PeriodKey = '1w' | '1m' | '3m' | '6m' | '12m';

type PeriodCounts = {
    roll_sufficient: number;
    roll_short: number;
    waste_within: number;
    waste_excess: number;
};

const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: '1w',  label: '1W' },
    { key: '1m',  label: '1M' },
    { key: '3m',  label: '3M' },
    { key: '6m',  label: '6M' },
    { key: '12m', label: '1Y' },
];

type Record = {
    id: number;
    calculated_at: string;
    shift_period: string | null;
    production_order: string | null;
    weaving_style: string | null;
    actual_length: string | null;
    actual_gpm: string | null;
    total_rolls: string | null;
    total_roll_produced: string | null;
    waste_estimate_kg: string | null;
    standard_waste_kg: string | null;
    tolerance_kg_snapshot: string | null;
    roll_status: string | null;
    waste_status: string | null;
    shift_group: { group_name: string } | null;
    machine: { machine_name: string; machine_code: string } | null;
};

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color?: string }) {
    return (
        <Card>
            <CardContent className="px-5 py-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-3xl font-bold tabular-nums ${color ?? ''}`}>{value}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
        </Card>
    );
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

export default function WeavingDashboard({
    counts,
    periodCounts,
    recentRecords,
}: {
    counts: Counts;
    periodCounts: { [K in PeriodKey]: PeriodCounts };
    recentRecords: Record[];
}) {
    const [period, setPeriod] = useState<PeriodKey>('1w');
    const pc = periodCounts[period];

    return (
        <>
            <Head title="Weaving Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Weaving Dashboard</h1>
                        <p className="text-sm text-muted-foreground">{counts.total} total calculations</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={recordsIndex()} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
                            <FileText className="h-4 w-4" />
                            All Records
                        </Link>
                        <Link href={weavingCalculator()} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Calculator className="h-4 w-4" />
                            New Calculation
                        </Link>
                    </div>
                </div>

                {/* Summary stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Today" value={counts.today} />
                    <StatCard label="This Week" value={counts.this_week} />
                    <StatCard label="Short Roll Risk" value={counts.roll_short} color="text-red-600 dark:text-red-400" sub="all time" />
                    <StatCard label="Excess Waste" value={counts.waste_excess} color="text-amber-600 dark:text-amber-400" sub="all time" />
                </div>

                {/* Roll status breakdown */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Status Breakdown</p>
                        <div className="flex rounded-md border text-xs font-medium overflow-hidden">
                            {PERIODS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setPeriod(key)}
                                    className={`px-3 py-1.5 transition-colors ${period === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Roll Status</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-6">
                                <div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">{pc.roll_sufficient}</p>
                                    <p className="text-xs text-muted-foreground">Sufficient</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">{pc.roll_short}</p>
                                    <p className="text-xs text-muted-foreground">Short risk</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Waste vs Standard</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-6">
                                <div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">{pc.waste_within}</p>
                                    <p className="text-xs text-muted-foreground">Within standard</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{pc.waste_excess}</p>
                                    <p className="text-xs text-muted-foreground">Excess waste</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent records */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-medium">Recent Calculations</h2>
                        <Link href={recordsIndex()} className="text-sm text-muted-foreground hover:underline">View all</Link>
                    </div>

                    {recentRecords.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                            No calculations saved yet.{' '}
                            <Link href={weavingCalculator()} className="underline">Run the first one.</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Date / Time</th>
                                        <th className="px-4 py-3 text-left font-medium">Loom</th>
                                        <th className="px-4 py-3 text-left font-medium">Shift</th>
                                        <th className="px-4 py-3 text-left font-medium">Production Order</th>
                                        <th className="px-4 py-3 text-left font-medium">Waste Est.</th>
                                        <th className="px-4 py-3 text-left font-medium">Std Waste</th>
                                        <th className="px-4 py-3 text-left font-medium">Adj. Suggestion</th>
                                        <th className="px-4 py-3 text-left font-medium">Roll</th>
                                        <th className="px-4 py-3 text-left font-medium">Waste</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRecords.map((r) => (
                                        <tr key={r.id} className="border-t">
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {new Date(r.calculated_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.machine
                                                    ? <><span className="font-medium">{r.machine.machine_name}</span><span className="ml-1 font-mono text-xs text-muted-foreground">({r.machine.machine_code})</span></>
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.shift_group?.group_name ?? '—'}
                                                {r.shift_period && <span className="ml-1 text-muted-foreground">P{r.shift_period}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{r.production_order ?? '—'}</td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {(() => {
                                                    if (r.waste_estimate_kg == null) return '—';
                                                    const we = parseFloat(r.waste_estimate_kg);
                                                    const sw = r.standard_waste_kg != null ? parseFloat(r.standard_waste_kg) : null;
                                                    const cls = sw === null ? '' : we > sw ? 'text-red-600 dark:text-red-400' : we < sw ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';
                                                    return <span className={cls}>{we.toFixed(3)} kg</span>;
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                                {r.standard_waste_kg != null ? `${parseFloat(r.standard_waste_kg).toFixed(3)} kg` : '—'}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {(() => {
                                                    const we = r.waste_estimate_kg != null ? parseFloat(r.waste_estimate_kg) : null;
                                                    const sw = r.standard_waste_kg != null ? parseFloat(r.standard_waste_kg) : null;
                                                    const gpm = r.actual_gpm != null ? parseFloat(r.actual_gpm) : null;
                                                    const remain = (r.total_rolls != null ? parseFloat(r.total_rolls) : 0)
                                                                 - (r.total_roll_produced != null ? parseFloat(r.total_roll_produced) : 0);
                                                    const tol = r.tolerance_kg_snapshot != null ? parseFloat(r.tolerance_kg_snapshot) : null;
                                                    if (we === null || sw === null) return <span className="text-muted-foreground">—</span>;
                                                    if (tol !== null && Math.abs(we - sw) < tol)
                                                        return <span className="text-muted-foreground">0 m</span>;
                                                    if (gpm === null || gpm === 0 || remain <= 0) return <span className="text-muted-foreground">—</span>;
                                                    const rawAdj = (we - sw) / gpm * 1000 / remain;
                                                    const adj = (rawAdj >= 0 ? 1 : -1) * Math.ceil(Math.abs(rawAdj) / 5) * 5;
                                                    const cls = adj > 0 ? 'text-green-600 dark:text-green-400' : adj < 0 ? 'text-red-600 dark:text-red-400' : '';
                                                    return <span className={cls}>{adj > 0 ? '+' : ''}{adj.toFixed(0)} m</span>;
                                                })()}
                                            </td>
                                            <td className="px-4 py-3"><RollBadge status={r.roll_status} /></td>
                                            <td className="px-4 py-3"><WasteBadge status={r.waste_status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

WeavingDashboard.layout = {
    breadcrumbs: [{ title: 'Weaving Dashboard', href: '/weaving-dashboard' }],
};
