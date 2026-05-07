import AdminSettingsLayout from '@/components/admin-settings-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface BackupRow {
    id: number;
    name: string;
    status: string;
    progress_percentage: number;
    size_bytes: number;
    notes?: string | null;
    created_at?: string | null;
    restored_at?: string | null;
    creator?: string | null;
}

export default function Index({
    backups,
}: {
    backups: BackupRow[];
}) {
    const form = useForm({});
    const [displayProgress, setDisplayProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState(
        'Preparing backup workspace...',
    );

    useEffect(() => {
        if (!form.processing) {
            setDisplayProgress(0);
            setProgressMessage('Preparing backup workspace...');
            return;
        }

        const stages = [
            { percentage: 12, message: 'Preparing backup workspace...' },
            { percentage: 34, message: 'Creating database dump...' },
            { percentage: 58, message: 'Collecting project files...' },
            { percentage: 82, message: 'Packing archive...' },
            { percentage: 96, message: 'Finalising restore point...' },
        ];

        let stageIndex = 0;
        setDisplayProgress(stages[0].percentage);
        setProgressMessage(stages[0].message);

        const timer = window.setInterval(() => {
            stageIndex = Math.min(stageIndex + 1, stages.length - 1);
            setDisplayProgress(stages[stageIndex].percentage);
            setProgressMessage(stages[stageIndex].message);
        }, 1200);

        return () => window.clearInterval(timer);
    }, [form.processing]);

    return (
        <AdminSettingsLayout
            title="Backups"
            description="Create and restore full downloadable restore points for the website, uploaded assets, environment settings, and database."
            activeHref="/admin/settings/backups"
        >
            <Head title="Backup settings" />

            <div className="space-y-6">
                <section className="rounded-[2rem] border border-amber-100 bg-linear-to-br from-[#132d24] via-[#15523c] to-[#d89a2f] p-6 text-white shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.22em] text-emerald-100 uppercase">Backup portal</p>
                    <h1 className="mt-2 text-3xl font-semibold">Restore points</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/82">
                        Create a full downloadable backup of the site with project files, uploads, environment settings, and database dump. Restore only from backups created here.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => form.post('/admin/settings/backups')}
                            disabled={form.processing}
                            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17331f] transition hover:bg-white/90"
                        >
                            {form.processing
                                ? 'Creating backup...'
                                : 'Create full backup'}
                        </button>
                    </div>
                    {form.processing && (
                        <div className="mt-5 rounded-[1.5rem] border border-white/15 bg-black/15 p-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-white">
                                <span>Backup in progress</span>
                                <span>{displayProgress}%</span>
                            </div>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                                <div
                                    className="h-full rounded-full bg-[#f0a23b] transition-all duration-700"
                                    style={{ width: `${displayProgress}%` }}
                                />
                            </div>
                            <p className="mt-3 text-sm text-white/82">
                                {progressMessage}
                            </p>
                        </div>
                    )}
                </section>

                <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                    Restoring a backup will overwrite the current database and project files with the selected restore point. Use this only when you want to roll the site back to that exact snapshot.
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">Available backups</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {backups.map((backup) => (
                            <div key={backup.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-lg font-semibold text-slate-900">{backup.name}</h2>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(backup.status)}`}>{backup.status}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                        <span>Size: {formatSize(backup.size_bytes)}</span>
                                        <span>Created: {backup.created_at ? new Date(backup.created_at).toLocaleString() : '-'}</span>
                                        <span>By: {backup.creator || 'System'}</span>
                                        <span>Progress: {backup.progress_percentage}%</span>
                                        {backup.restored_at && <span>Last restored: {new Date(backup.restored_at).toLocaleString()}</span>}
                                    </div>
                                    {(backup.status === 'creating' ||
                                        backup.status === 'restoring') && (
                                        <div className="mt-3 max-w-xl">
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                                    style={{
                                                        width: `${backup.progress_percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {backup.notes && <p className="mt-2 text-sm text-slate-600">{backup.notes}</p>}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={`/admin/settings/backups/${backup.id}/download`}
                                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                            backup.status !== 'ready'
                                                ? 'pointer-events-none border-slate-200 text-slate-400'
                                                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        Download
                                    </Link>
                                    <Link
                                        as="button"
                                        method="post"
                                        href={`/admin/settings/backups/${backup.id}/restore`}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                                            backup.status !== 'ready'
                                                ? 'pointer-events-none bg-slate-300'
                                                : 'bg-[#123524] hover:bg-[#1a4d36]'
                                        }`}
                                    >
                                        Restore this backup
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={`/admin/settings/backups/${backup.id}`}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                                            backup.status === 'creating' ||
                                            backup.status === 'restoring'
                                                ? 'pointer-events-none bg-slate-300'
                                                : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                        Delete
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {backups.length === 0 && (
                            <div className="px-6 py-16 text-center text-sm text-slate-500">No backup restore points have been created yet.</div>
                        )}
                    </div>
                </section>
            </div>
        </AdminSettingsLayout>
    );
}

function statusBadgeClass(status: string) {
    if (status === 'ready') {
        return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'failed') {
        return 'bg-red-100 text-red-700';
    }

    if (status === 'restoring') {
        return 'bg-amber-100 text-amber-700';
    }

    return 'bg-slate-100 text-slate-600';
}

function formatSize(size: number) {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
