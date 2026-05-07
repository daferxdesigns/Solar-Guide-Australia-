import AdminSettingsLayout from '@/components/admin-settings-layout';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function General({
    settings,
    homepageOptions,
}: {
    settings: {
        site_title: string;
        site_tagline: string;
        hero_title: string;
        hero_subtitle: string;
        homepage_background_image_url?: string | null;
        homepage_page_id?: number | null;
        custom_homepage_enabled: boolean;
    };
    homepageOptions: Array<{
        id: number;
        title: string;
        slug: string;
        status: string;
    }>;
}) {
    const [form, setForm] = useState({
        site_title: settings.site_title ?? '',
        site_tagline: settings.site_tagline ?? '',
        hero_title: settings.hero_title ?? '',
        hero_subtitle: settings.hero_subtitle ?? '',
        custom_homepage_enabled: Boolean(settings.custom_homepage_enabled),
        homepage_page_id: settings.homepage_page_id ? String(settings.homepage_page_id) : '',
        remove_homepage_background_image: false,
        homepage_background_image: null as File | null,
    });
    const [preview, setPreview] = useState<string | null>(
        settings.homepage_background_image_url ?? null,
    );

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        if (target instanceof HTMLInputElement && target.type === 'file') {
            const file = target.files?.[0] ?? null;

            setForm((current) => ({
                ...current,
                homepage_background_image: file,
                remove_homepage_background_image: false,
            }));
            setPreview(
                file
                    ? URL.createObjectURL(file)
                    : settings.homepage_background_image_url ?? null,
            );
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            '/admin/settings/general',
            {
                ...form,
                remove_homepage_background_image: form.remove_homepage_background_image
                    ? 1
                    : 0,
                homepage_page_id:
                    form.custom_homepage_enabled && form.homepage_page_id !== ''
                        ? Number(form.homepage_page_id)
                        : null,
            },
            { forceFormData: true },
        );
    };

    return (
        <AdminSettingsLayout
            title="General"
            description="Control the site name, hero copy, homepage selection, and the homepage background shown across Solar Support Australia."
            activeHref="/admin/settings/general"
        >
            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
            >
                <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Site title
                            </label>
                            <input
                                name="site_title"
                                value={form.site_title}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Site tagline
                            </label>
                            <input
                                name="site_tagline"
                                value={form.site_tagline}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Homepage hero title
                        </label>
                        <input
                            name="hero_title"
                            value={form.hero_title}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Homepage hero subtitle
                        </label>
                        <textarea
                            name="hero_subtitle"
                            value={form.hero_subtitle}
                            onChange={handleChange}
                            rows={5}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                name="custom_homepage_enabled"
                                checked={form.custom_homepage_enabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            Enable custom homepage page
                        </label>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            When enabled, you can select a custom page to use as the main homepage. When disabled, the default guides homepage will be used.
                        </p>
                    </div>

                    {form.custom_homepage_enabled && (
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Main homepage page
                            </label>
                            <select
                                name="homepage_page_id"
                                value={form.homepage_page_id}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="">Use Guides homepage at /</option>
                                {homepageOptions.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.title} ({page.status})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                Select a created page to take over the main homepage at `/`. If left blank, the guides homepage remains the default landing page.
                            </p>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Homepage background
                        </h2>
                        <div className="mt-4 space-y-4">
                            <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Homepage background preview"
                                        className="h-64 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-slate-500">
                                        Upload a homepage hero background image.
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                name="homepage_background_image"
                                accept="image/*"
                                onChange={handleChange}
                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                            />
                            {preview && (
                                <label className="flex items-center gap-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="remove_homepage_background_image"
                                        checked={
                                            form.remove_homepage_background_image
                                        }
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-slate-300 text-red-600"
                                    />
                                    Remove current background image
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Save general settings
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
