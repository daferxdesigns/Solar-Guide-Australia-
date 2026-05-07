import AdminSettingsLayout from '@/components/admin-settings-layout';
import { ChangeEvent, FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

export default function Captcha({
    settings,
}: {
    settings: {
        captcha_enabled: boolean;
        captcha_provider: 'recaptcha_v2' | 'recaptcha_v3';
        captcha_site_key: string;
        captcha_secret_key: string;
        captcha_forms: Record<string, boolean>;
    };
}) {
    const [form, setForm] = useState({
        captcha_enabled: settings.captcha_enabled,
        captcha_provider: settings.captcha_provider ?? 'recaptcha_v2',
        captcha_site_key: settings.captcha_site_key ?? '',
        captcha_secret_key: settings.captcha_secret_key ?? '',
        captcha_forms: settings.captcha_forms ?? {
            contact: false,
            calculator: false,
            chat: false,
            comment: false,
            subscribe: false,
        },
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            if (target.name.startsWith('captcha_forms.')) {
                const key = target.name.replace('captcha_forms.', '');
                setForm((current) => ({
                    ...current,
                    captcha_forms: {
                        ...current.captcha_forms,
                        [key]: target.checked,
                    },
                }));
                return;
            }

            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/settings/captcha', form);
    };

    return (
        <AdminSettingsLayout
            title="Captcha"
            description="Configure Google reCAPTCHA from the admin panel and decide which public forms should be protected."
            activeHref="/admin/settings/captcha"
        >
            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <input
                            type="checkbox"
                            name="captcha_enabled"
                            checked={form.captcha_enabled}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        <span>
                            <span className="block text-sm font-semibold text-slate-800">Enable Google captcha</span>
                            <span className="text-xs text-slate-500">Once enabled, the selected forms will be ready to use your configured site and secret keys.</span>
                        </span>
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Provider</label>
                            <select
                                name="captcha_provider"
                                value={form.captcha_provider}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="recaptcha_v2">Google reCAPTCHA v2</option>
                                <option value="recaptcha_v3">Google reCAPTCHA v3</option>
                            </select>
                        </div>
                        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                            Add the site key and secret here instead of editing templates or controllers manually.
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">Site key</label>
                        <input
                            name="captcha_site_key"
                            value={form.captcha_site_key}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">Secret key</label>
                        <input
                            name="captcha_secret_key"
                            value={form.captcha_secret_key}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">Protect these forms</h2>
                        <div className="mt-4 space-y-3">
                            {[
                                ['contact', 'Contact form'],
                                ['calculator', 'Solar calculator'],
                                ['chat', 'Live chat'],
                                ['comment', 'Article comments'],
                                ['subscribe', 'Footer subscribe'],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        name={`captcha_forms.${key}`}
                                        checked={Boolean(form.captcha_forms[key])}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                            Save captcha settings
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
