import { AdminUserForm } from '@/components/admin-user-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ShieldPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Add user', href: '/admin/users/create' },
];

export default function Create() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/users', form);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add User" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Team Access</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Add a new user</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                Create a new admin login for someone who needs access to publish articles, moderate comments, or manage the website.
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
                        <AdminUserForm form={form} setForm={setForm} />

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button type="submit" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Create user
                            </button>
                            <Link href="/admin/users" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                Cancel
                            </Link>
                        </div>
                    </form>

                    <aside className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                            <ShieldPlus className="h-5 w-5" />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-slate-900">What this user gets</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            New users can sign in to the admin dashboard, manage posts and categories, moderate comments, review analytics, and update website settings.
                        </p>
                        <div className="mt-6 space-y-3 text-sm text-slate-700">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">Use a unique email address for each team member.</div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">Set a strong password with at least 8 characters.</div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">They can update their own profile after signing in.</div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
