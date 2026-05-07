import AdminSettingsLayout from '@/components/admin-settings-layout';
import { Link, router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function Menus({
    settings,
    menuStats,
}: {
    settings: {
        dynamic_menus_enabled: boolean;
    };
    menuStats: {
        total: number;
        active: number;
        top_level: number;
    };
}) {
    const [form, setForm] = useState({
        dynamic_menus_enabled: Boolean(settings.dynamic_menus_enabled),
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.checked,
        }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/settings/menus', form);
    };

    return (
        <AdminSettingsLayout
            title="Menu Settings"
            description="Choose whether the public website uses its default navigation or the admin-managed dynamic menu structure."
            activeHref="/admin/settings/menus"
        >
            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            name="dynamic_menus_enabled"
                            checked={form.dynamic_menus_enabled}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        Enable dynamic menus from admin panel
                    </label>

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        When <span className="font-semibold text-slate-900">disabled</span>, the website uses the built-in navigation. When <span className="font-semibold text-slate-900">enabled</span>, it uses the menu structure created in Menu Management.
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Menu Management
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Use the dedicated menu builder to add, edit, nest,
                            and reorder individual navigation items.
                        </p>
                        <div className="mt-4">
                            <Link
                                href="/admin/menus"
                                className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Open Menu Management
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Menu stats
                        </h2>
                        <div className="mt-4 grid gap-3">
                            <StatCard label="Total menu items" value={menuStats.total} />
                            <StatCard label="Active items" value={menuStats.active} />
                            <StatCard label="Top-level items" value={menuStats.top_level} />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Save menu settings
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
                {value}
            </div>
        </div>
    );
}
