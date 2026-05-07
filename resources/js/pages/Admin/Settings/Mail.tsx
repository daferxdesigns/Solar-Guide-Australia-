import AdminSettingsLayout from '@/components/admin-settings-layout';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Mail({
    settings,
}: {
    settings: {
        mail_enabled: boolean;
        mail_mailer: 'smtp' | 'log';
        mail_host: string;
        mail_port: number;
        mail_encryption: 'tls' | 'ssl';
        mail_username: string;
        mail_password: string;
        mail_from_address: string;
        mail_from_name: string;
        contact_notification_email: string;
    };
}) {
    const [form, setForm] = useState({
        mail_enabled: Boolean(settings.mail_enabled),
        mail_mailer: settings.mail_mailer ?? 'smtp',
        mail_host: settings.mail_host ?? 'smtp.gmail.com',
        mail_port: Number(settings.mail_port ?? 587),
        mail_encryption: settings.mail_encryption ?? 'tls',
        mail_username: settings.mail_username ?? '',
        mail_password: settings.mail_password ?? '',
        mail_from_address: settings.mail_from_address ?? '',
        mail_from_name:
            settings.mail_from_name ?? 'Solar Support Australia',
        contact_notification_email:
            settings.contact_notification_email ?? 'daferxdesigns@gmail.com',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        if (target instanceof HTMLInputElement && target.type === 'number') {
            setForm((current) => ({
                ...current,
                [target.name]: target.value === '' ? 0 : Number(target.value),
            }));
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/settings/mail', form);
    };

    const applyGmailDefaults = () => {
        setForm((current) => ({
            ...current,
            mail_enabled: true,
            mail_mailer: 'smtp',
            mail_host: 'smtp.gmail.com',
            mail_port: 587,
            mail_encryption: 'tls',
        }));
    };

    return (
        <AdminSettingsLayout
            title="Mail SMTP"
            description="Configure outgoing email for calculator results, password resets, and admin notifications. Gmail app-password setup is ready here."
            activeHref="/admin/settings/mail"
        >
            <form onSubmit={submit} className="space-y-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-3xl">
                            <label className="flex items-center gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="mail_enabled"
                                    checked={form.mail_enabled}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                />
                                Enable custom mail settings
                            </label>
                            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                For Gmail, use <span className="font-semibold text-slate-900">`smtp.gmail.com`</span>, your Gmail address as the username, and a <span className="font-semibold text-slate-900">Google app password</span> instead of your normal sign-in password.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={applyGmailDefaults}
                            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                        >
                            Use Gmail defaults
                        </button>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Mailer
                            </label>
                            <select
                                name="mail_mailer"
                                value={form.mail_mailer}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="smtp">SMTP</option>
                                <option value="log">Log only</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Encryption
                            </label>
                            <select
                                name="mail_encryption"
                                value={form.mail_encryption}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                SMTP host
                            </label>
                            <input
                                name="mail_host"
                                value={form.mail_host}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="smtp.gmail.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Port
                            </label>
                            <input
                                name="mail_port"
                                type="number"
                                value={form.mail_port}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="587"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Username / email
                            </label>
                            <input
                                name="mail_username"
                                value={form.mail_username}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Password / app password
                            </label>
                            <div className="relative">
                                <input
                                    name="mail_password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.mail_password}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500"
                                    placeholder={
                                        settings.mail_password
                                            ? 'Saved password shown above'
                                            : 'Enter SMTP password'
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {settings.mail_password && (
                                <p className="mt-2 text-xs text-slate-500">
                                    A password is already saved. Leave this blank
                                    to keep the current one.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                From address
                            </label>
                            <input
                                name="mail_from_address"
                                type="email"
                                value={form.mail_from_address}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="support@example.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                From name
                            </label>
                            <input
                                name="mail_from_name"
                                value={form.mail_from_name}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="Solar Support Australia"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Contact form notification email
                            </label>
                            <input
                                name="contact_notification_email"
                                type="email"
                                value={form.contact_notification_email}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="daferxdesigns@gmail.com"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                All incoming website contact enquiries will be
                                sent to this email address through the SMTP
                                settings above.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Save mail settings
                    </button>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => router.post('/admin/settings/mail/test')}
                            className="w-full rounded-2xl bg-slate-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Send Test Email
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
