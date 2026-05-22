import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { create } from '@/routes/cleaning-records';

type CleaningRecord = {
    id: number;
    cleaning_date: string;
    next_due_date: string;
    duration_since_last: number | null;
    performed_by_leader: string;
    started_by_leader: string;
    notes: string | null;
    machine: { machine_name: string; machine_code: string } | null;
    performed_by_group: { group_name: string } | null;
    started_by_group: { group_name: string } | null;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function CleaningRecordsIndex({ records }: { records: PaginatedData<CleaningRecord> }) {
    return (
        <>
            <Head title="Cleaning Records" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Heading
                        title="Cleaning Records"
                        description="Append-only log of all machine cleanings."
                    />
                    <Link href={create()}>
                        <Button>Log Cleaning</Button>
                    </Link>
                </div>

                {records.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        No cleaning records yet.{' '}
                        <Link href={create()} className="underline">
                            Log the first cleaning.
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Machine</th>
                                        <th className="px-4 py-3 text-left font-medium">Cleaned On</th>
                                        <th className="px-4 py-3 text-left font-medium">Performed By</th>
                                        <th className="px-4 py-3 text-left font-medium">Restarted By</th>
                                        <th className="px-4 py-3 text-left font-medium">Days Since Last</th>
                                        <th className="px-4 py-3 text-left font-medium">Next Due</th>
                                        <th className="px-4 py-3 text-left font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.map((record) => (
                                        <tr key={record.id} className="border-t">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{record.machine?.machine_name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{record.machine?.machine_code}</div>
                                            </td>
                                            <td className="px-4 py-3">{record.cleaning_date}</td>
                                            <td className="px-4 py-3">
                                                <div>{record.performed_by_group?.group_name}</div>
                                                <div className="text-xs text-muted-foreground">{record.performed_by_leader}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{record.started_by_group?.group_name}</div>
                                                <div className="text-xs text-muted-foreground">{record.started_by_leader}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {record.duration_since_last != null ? `${record.duration_since_last} days` : '—'}
                                            </td>
                                            <td className="px-4 py-3">{record.next_due_date}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{record.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {records.last_page > 1 && (
                            <div className="mt-4 flex justify-between text-sm">
                                {records.prev_page_url ? (
                                    <Link href={records.prev_page_url} className="underline">
                                        Previous
                                    </Link>
                                ) : <span />}
                                <span className="text-muted-foreground">
                                    Page {records.current_page} of {records.last_page}
                                </span>
                                {records.next_page_url ? (
                                    <Link href={records.next_page_url} className="underline">
                                        Next
                                    </Link>
                                ) : <span />}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

CleaningRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cleaning Records', href: '/cleaning-records' },
    ],
};
