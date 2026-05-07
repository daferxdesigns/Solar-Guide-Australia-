import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Pencil, Search, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { ChangeEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

interface UserRow {
    id: number;
    name: string;
    email: string;
    initials: string;
    email_verified_at?: string | null;
    created_at: string;
    post_count: number;
    comment_count: number;
}

export default function Index({
    users,
    filters,
    stats,
}: {
    users: UserRow[];
    filters: {
        search: string;
    };
    stats: {
        total_users: number;
        verified_users: number;
        unverified_users: number;
        newest_user?: string | null;
    };
}) {
    const updateSearch = (value: string) => {
        router.get('/admin/users', { search: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-[#0d2d43] via-[#13536f] to-[#f2a541] p-6 text-white shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-100 uppercase">Team Access</p>
                            <h1 className="mt-2 text-3xl font-semibold">User management</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-50/90">
                                Manage the people who can access the website admin, publish solar guides, and help moderate content.
                            </p>
                        </div>
                        <Link href="/admin/users/create" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#13536f] transition hover:bg-cyan-50">
                            <UserPlus className="h-4 w-4" />
                            Add new user
                        </Link>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Total users" value={stats.total_users.toString()} icon={<Users className="h-5 w-5" />} />
                    <MetricCard label="Verified access" value={stats.verified_users.toString()} icon={<ShieldCheck className="h-5 w-5" />} />
                    <MetricCard label="Needs verification" value={stats.unverified_users.toString()} icon={<Mail className="h-5 w-5" />} />
                    <MetricCard label="Newest member" value={stats.newest_user || 'No users yet'} icon={<Pencil className="h-5 w-5" />} />
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            defaultValue={filters.search}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => updateSearch(event.target.value)}
                            placeholder="Search users by name or email..."
                            className="h-12 w-full rounded-2xl border border-slate-300 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="hidden grid-cols-[minmax(0,1.3fr)_180px_180px_180px_140px] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase lg:grid">
                        <div>User</div>
                        <div>Status</div>
                        <div>Guides</div>
                        <div>Comment identity</div>
                        <div className="text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <article key={user.id} className="px-5 py-5 lg:px-6">
                                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_140px] lg:items-center">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-800">
                                                {user.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-base font-semibold text-slate-900">{user.name}</div>
                                                <div className="truncate text-sm text-slate-500">{user.email}</div>
                                                <div className="mt-1 text-xs text-slate-400">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                user.email_verified_at ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {user.email_verified_at ? 'Verified' : 'Pending verification'}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{user.post_count}</div>
                                        <div className="text-xs text-slate-500">Posts authored</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{user.comment_count}</div>
                                        <div className="text-xs text-slate-500">Comments using this email</div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        <Link
                                            href={`/admin/users/${user.id}/edit`}
                                            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm(`Delete "${user.name}"?`)) {
                                                    router.delete(`/admin/users/${user.id}`);
                                                }
                                            }}
                                            className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {users.length === 0 && (
                            <div className="px-6 py-14 text-center text-sm text-slate-500">No users found for this search.</div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function MetricCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
                <div className="rounded-full bg-slate-100 p-2 text-slate-600">{icon}</div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}
