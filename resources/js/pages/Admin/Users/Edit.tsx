import { AdminUserForm } from '@/components/admin-user-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Mail, PencilLine } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string | null;
    post_count: number;
    comment_count: number;
}

export default function Edit({ user }: { user: UserRecord }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}/edit` },
    ];

    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.put(`/admin/users/${user.id}`, form);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Team Member</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user.name}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                Update their access details, contact email, and password from one place.
                            </p>
                        </div>
                        <Link href="/admin/users" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back to users
                        </Link>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <AdminUserForm form={form} setForm={setForm} passwordRequired={false} />

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button type="submit" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Save changes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(`Delete "${user.name}"?`)) {
                                        router.delete(`/admin/users/${user.id}`);
                                    }
                                }}
                                className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                                Delete user
                            </button>
                        </div>
                    </form>

                    <aside className="space-y-4">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <PencilLine className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-slate-900">{user.name}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-3">
                                <InfoTile
                                    icon={<BadgeCheck className="h-4 w-4" />}
                                    label="Verification"
                                    value={user.email_verified_at ? 'Verified email' : 'Pending verification'}
                                />
                                <InfoTile
                                    icon={<PencilLine className="h-4 w-4" />}
                                    label="Posts authored"
                                    value={String(user.post_count)}
                                />
                                <InfoTile
                                    icon={<Mail className="h-4 w-4" />}
                                    label="Comments by email"
                                    value={String(user.comment_count)}
                                />
                            </div>
                            {user.created_at && <div className="mt-5 text-xs text-slate-400">Created {new Date(user.created_at).toLocaleString()}</div>}
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoTile({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                <span className="text-slate-400">{icon}</span>
                <span>{label}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
        </div>
    );
}
