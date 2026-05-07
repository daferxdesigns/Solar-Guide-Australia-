import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AdminSettingsLayout({
    title,
    description,
    activeHref,
    children,
}: PropsWithChildren<{
    title: string;
    description: string;
    activeHref: string;
}>) {
    const { flash } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/admin/settings/general' },
        { title, href: activeHref },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${title} settings`} />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                            Settings
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                            {title}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-600">
                            {description}
                        </p>
                    </div>
                </section>

                {flash?.success && (
                    <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900">
                        {flash.success}
                    </section>
                )}

                {flash?.error && (
                    <section className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900">
                        {flash.error}
                    </section>
                )}

                {children}
            </div>
        </AppLayout>
    );
}
