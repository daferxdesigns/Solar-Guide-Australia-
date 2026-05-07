import AdminSettingsLayout from '@/components/admin-settings-layout';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function Adsense({
    settings,
}: {
    settings: {
        adsense_enabled: boolean;
        adsense_display_ads: boolean;
        adsense_auto_ads_enabled: boolean;
        adsense_publisher_id: string;
        adsense_verification_code: string;
        adsense_header_slot: string;
        adsense_in_article_slot: string;
        adsense_sidebar_slot: string;
    };
}) {
    const [form, setForm] = useState({
        adsense_enabled: Boolean(settings.adsense_enabled),
        adsense_display_ads: Boolean(settings.adsense_display_ads),
        adsense_auto_ads_enabled: Boolean(settings.adsense_auto_ads_enabled),
        adsense_publisher_id: settings.adsense_publisher_id ?? '',
        adsense_verification_code: settings.adsense_verification_code ?? '',
        adsense_header_slot: settings.adsense_header_slot ?? '',
        adsense_in_article_slot: settings.adsense_in_article_slot ?? '',
        adsense_sidebar_slot: settings.adsense_sidebar_slot ?? '',
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;

        if (target.type === 'checkbox') {
            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/settings/adsense', form);
    };

    return (
        <AdminSettingsLayout
            title="Google AdSense"
            description="Keep AdSense verification, publisher, and slot settings in one place so the site stays ready for ad rollout when you need it."
            activeHref="/admin/settings/adsense"
        >
            <form onSubmit={submit} className="space-y-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                name="adsense_enabled"
                                checked={form.adsense_enabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            Enable AdSense account script
                        </label>
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                name="adsense_display_ads"
                                checked={form.adsense_display_ads}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            Show ad spaces on the website
                        </label>
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                name="adsense_auto_ads_enabled"
                                checked={form.adsense_auto_ads_enabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            Auto ads enabled in account
                        </label>
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Turn on <span className="font-semibold text-slate-900">Show ad spaces on the website</span> only when you want live ad placements visible to readers.
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <input
                            name="adsense_publisher_id"
                            value={form.adsense_publisher_id}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                        />
                        <input
                            name="adsense_verification_code"
                            value={form.adsense_verification_code}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="google-adsense-account meta value"
                        />
                        <input
                            name="adsense_header_slot"
                            value={form.adsense_header_slot}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="Header slot ID"
                        />
                        <input
                            name="adsense_in_article_slot"
                            value={form.adsense_in_article_slot}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="In-article slot ID"
                        />
                        <input
                            name="adsense_sidebar_slot"
                            value={form.adsense_sidebar_slot}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="Sidebar slot ID"
                        />
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Save AdSense settings
                    </button>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
