import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, HelpCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { index as machinesIndex } from '@/routes/machines';
import { create as logCleaning } from '@/routes/cleaning-records';

type CleaningRecord = {
    id: number;
    cleaning_date: string;
    next_due_date: string;
    duration_since_last: number | null;
    performed_by_leader: string;
    started_by_leader: string;
    notes: string | null;
    performed_by_group: { group_name: string } | null;
    started_by_group: { group_name: string } | null;
};

type Machine = {
    id: number;
    machine_name: string;
    machine_code: string;
    location: string | null;
    status: string;
    due_status: string;
    machine_type: { type_name: string } | null;
    latest_cleaning_record: CleaningRecord | null;
    cleaning_records: CleaningRecord[];
};

type Props = {
    machines: Machine[];
    grouped: {
        Overdue: Machine[];
        'Due soon': Machine[];
        OK: Machine[];
        'No Record': Machine[];
    };
    counts: {
        overdue: number;
        due_soon: number;
        ok: number;
        no_record: number;
    };
};

const statusConfig = {
    Overdue: { badge: 'destructive' as const, icon: AlertTriangle, iconClass: 'text-red-500' },
    'Due soon': { badge: 'secondary' as const, icon: Clock, iconClass: 'text-yellow-500' },
    OK: { badge: 'default' as const, icon: CheckCircle, iconClass: 'text-green-500' },
    'No Record': { badge: 'outline' as const, icon: HelpCircle, iconClass: 'text-neutral-400' },
};

function DueStatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig['No Record'];
    return <Badge variant={config.badge}>{status}</Badge>;
}

function MachineDetailDialog({ machine }: { machine: Machine }) {
    const latest = machine.latest_cleaning_record;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Info className="h-3.5 w-3.5" />
                    <span className="ml-1">Details</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {machine.machine_name}{' '}
                        <span className="font-mono text-sm font-normal text-muted-foreground">
                            ({machine.machine_code})
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {machine.machine_type?.type_name ?? 'Unknown type'} ·{' '}
                        {machine.location ?? 'No location'}
                    </DialogDescription>
                </DialogHeader>

                {/* Machine summary */}
                <div className="rounded-lg border text-sm">
                    <div className="grid grid-cols-[140px_1fr_140px_1fr] divide-x divide-y">
                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Type</div>
                        <div className="px-3 py-2">{machine.machine_type?.type_name ?? '—'}</div>
                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Location</div>
                        <div className="px-3 py-2">{machine.location ?? '—'}</div>

                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Machine Status</div>
                        <div className="px-3 py-2">
                            <Badge variant={machine.status === 'Active' ? 'default' : 'secondary'}>
                                {machine.status}
                            </Badge>
                        </div>
                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Cleaning Status</div>
                        <div className="px-3 py-2">
                            <DueStatusBadge status={machine.due_status} />
                        </div>

                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Last Cleaned</div>
                        <div className="px-3 py-2">{latest?.cleaning_date ?? '—'}</div>
                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Next Due</div>
                        <div className="px-3 py-2">{latest?.next_due_date ?? '—'}</div>

                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Last Team</div>
                        <div className="px-3 py-2">{latest?.performed_by_group?.group_name ?? '—'}</div>
                        <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Last Leader</div>
                        <div className="px-3 py-2">{latest?.performed_by_leader ?? '—'}</div>
                    </div>
                </div>

                {/* Cleaning history */}
                <div>
                    <h3 className="mb-2 text-sm font-medium">
                        Cleaning History ({machine.cleaning_records.length} records)
                    </h3>

                    {machine.cleaning_records.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No cleaning records yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium">Date</th>
                                        <th className="px-3 py-2 text-left font-medium">Team</th>
                                        <th className="px-3 py-2 text-left font-medium">Leader (snapshot)</th>
                                        <th className="px-3 py-2 text-left font-medium">Restarted By</th>
                                        <th className="px-3 py-2 text-left font-medium">Restart Leader</th>
                                        <th className="px-3 py-2 text-left font-medium">Days Since Prev</th>
                                        <th className="px-3 py-2 text-left font-medium">Next Due</th>
                                        <th className="px-3 py-2 text-left font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {machine.cleaning_records.map((record) => (
                                        <tr key={record.id} className="border-t">
                                            <td className="px-3 py-2 whitespace-nowrap">{record.cleaning_date}</td>
                                            <td className="px-3 py-2">{record.performed_by_group?.group_name ?? '—'}</td>
                                            <td className="px-3 py-2">{record.performed_by_leader}</td>
                                            <td className="px-3 py-2">{record.started_by_group?.group_name ?? '—'}</td>
                                            <td className="px-3 py-2">{record.started_by_leader}</td>
                                            <td className="px-3 py-2">
                                                {record.duration_since_last != null
                                                    ? `${record.duration_since_last} days`
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">{record.next_due_date}</td>
                                            <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate">
                                                {record.notes ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard({ machines, grouped, counts }: Props) {
    const totalActive = counts.overdue + counts.due_soon + counts.ok + counts.no_record;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Cleaning Compliance</h1>
                        <p className="text-sm text-muted-foreground">{totalActive} active machines</p>
                    </div>
                    <Link
                        href={logCleaning()}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Log Cleaning
                    </Link>
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Overdue', count: counts.overdue, className: 'border-red-200 dark:border-red-800' },
                        { label: 'Due Soon', count: counts.due_soon, className: 'border-yellow-200 dark:border-yellow-800' },
                        { label: 'OK', count: counts.ok, className: 'border-green-200 dark:border-green-800' },
                        { label: 'No Record', count: counts.no_record, className: 'border-neutral-200' },
                    ].map(({ label, count, className }) => (
                        <Card key={label} className={`p-4 ${className}`}>
                            <div className="text-3xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground">{label}</div>
                        </Card>
                    ))}
                </div>

                {/* All Machines table */}
                {totalActive === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No active machines found.{' '}
                        <Link href={machinesIndex()} className="underline">
                            Add machines
                        </Link>{' '}
                        to get started.
                    </div>
                ) : (
                    <div>
                        <h2 className="mb-3 font-medium">All Machines</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Machine</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Location</th>
                                        <th className="px-4 py-3 text-left font-medium">Last Cleaned</th>
                                        <th className="px-4 py-3 text-left font-medium">Days Since Prev</th>
                                        <th className="px-4 py-3 text-left font-medium">Last Team</th>
                                        <th className="px-4 py-3 text-left font-medium">Last Leader</th>
                                        <th className="px-4 py-3 text-left font-medium">Next Due</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {machines.map((machine) => {
                                        const latest = machine.latest_cleaning_record;
                                        return (
                                            <tr key={machine.id} className="border-t">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{machine.machine_name}</div>
                                                    <div className="font-mono text-xs text-muted-foreground">
                                                        {machine.machine_code}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {machine.machine_type?.type_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {machine.location ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {latest?.cleaning_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {latest?.duration_since_last != null
                                                        ? `${latest.duration_since_last} days`
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {latest?.performed_by_group?.group_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {latest?.performed_by_leader ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {latest?.next_due_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <DueStatusBadge status={machine.due_status} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <MachineDetailDialog machine={machine} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
