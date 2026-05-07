import AdminSettingsLayout from '@/components/admin-settings-layout';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function Seo({
    settings,
    endpoints,
}: {
    settings: {
        default_seo_title: string;
        default_seo_description: string;
        default_seo_keywords: string;
        google_site_verification_code: string;
        default_og_image_url?: string | null;
        seo_indexing_enabled: boolean;
        robots_txt_content: string;
        sitemap_enabled: boolean;
        sitemap_include_posts: boolean;
        sitemap_include_pages: boolean;
        sitemap_include_categories: boolean;
        sitemap_extra_urls: string;
    };
    endpoints: {
        robots_url: string;
        sitemap_url: string;
    };
}) {
    const [form, setForm] = useState({
        default_seo_title: settings.default_seo_title ?? '',
        default_seo_description: settings.default_seo_description ?? '',
        default_seo_keywords: settings.default_seo_keywords ?? '',
        google_site_verification_code:
            settings.google_site_verification_code ?? '',
        seo_indexing_enabled: Boolean(settings.seo_indexing_enabled),
        robots_txt_content: settings.robots_txt_content ?? '',
        sitemap_enabled: Boolean(settings.sitemap_enabled),
        sitemap_include_posts: Boolean(settings.sitemap_include_posts),
        sitemap_include_pages: Boolean(settings.sitemap_include_pages),
        sitemap_include_categories: Boolean(settings.sitemap_include_categories),
        sitemap_extra_urls: settings.sitemap_extra_urls ?? '',
        remove_default_og_image: false,
        default_og_image: null as File | null,
    });
    const [ogPreview, setOgPreview] = useState<string | null>(
        settings.default_og_image_url ?? null,
    );

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
                default_og_image: file,
                remove_default_og_image: false,
            }));
            setOgPreview(
                file
                    ? URL.createObjectURL(file)
                    : settings.default_og_image_url ?? null,
            );
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            '/admin/settings/seo',
            {
                ...form,
                seo_indexing_enabled: form.seo_indexing_enabled ? 1 : 0,
                sitemap_enabled: form.sitemap_enabled ? 1 : 0,
                sitemap_include_posts: form.sitemap_include_posts ? 1 : 0,
                sitemap_include_pages: form.sitemap_include_pages ? 1 : 0,
                sitemap_include_categories: form.sitemap_include_categories ? 1 : 0,
                remove_default_og_image: form.remove_default_og_image ? 1 : 0,
            },
            { forceFormData: true },
        );
    };

    return (
        <AdminSettingsLayout
            title="SEO & Crawling"
            description="Manage search metadata, Google verification, robots.txt, sitemap output, and social sharing defaults in one place."
            activeHref="/admin/settings/seo"
        >
            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
            >
                <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Search defaults
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Used on public pages that do not have their own SEO fields.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Default SEO title
                        </label>
                        <input
                            name="default_seo_title"
                            value={form.default_seo_title}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Default SEO description
                        </label>
                        <textarea
                            name="default_seo_description"
                            value={form.default_seo_description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Default SEO keywords
                        </label>
                        <textarea
                            name="default_seo_keywords"
                            value={form.default_seo_keywords}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Google site verification code
                        </label>
                        <input
                            name="google_site_verification_code"
                            value={form.google_site_verification_code}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="Paste the content value or the full meta tag"
                        />
                    </div>

                    <label className="flex items-center gap-3 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            name="seo_indexing_enabled"
                            checked={form.seo_indexing_enabled}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        Allow search engines to index public pages
                    </label>

                    <div className="border-t border-slate-200 pt-6">
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            robots.txt
                        </label>
                        <textarea
                            name="robots_txt_content"
                            value={form.robots_txt_content}
                            onChange={handleChange}
                            rows={9}
                            className="font-mono w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Use {'{sitemap_url}'} where the sitemap URL should be inserted.
                        </p>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Sitemap
                        </h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {[
                                ['sitemap_enabled', 'Enable sitemap'],
                                ['sitemap_include_posts', 'Include posts'],
                                ['sitemap_include_pages', 'Include pages'],
                                ['sitemap_include_categories', 'Include categories'],
                            ].map(([name, label]) => (
                                <label
                                    key={name}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                                >
                                    <input
                                        type="checkbox"
                                        name={name}
                                        checked={Boolean(
                                            form[name as keyof typeof form],
                                        )}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Extra sitemap URLs
                        </label>
                        <textarea
                            name="sitemap_extra_urls"
                            value={form.sitemap_extra_urls}
                            onChange={handleChange}
                            rows={6}
                            className="font-mono w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="/solar-calculator&#10;https://solarsupportaustralia.com/contact"
                        />
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Default social image
                        </h2>
                        <div className="mt-4 space-y-4">
                            <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50">
                                {ogPreview ? (
                                    <img
                                        src={ogPreview}
                                        alt="Default social sharing preview"
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-slate-500">
                                        Upload a default image for social cards and previews.
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                name="default_og_image"
                                accept="image/*"
                                onChange={handleChange}
                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                            />
                            {ogPreview && (
                                <label className="flex items-center gap-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="remove_default_og_image"
                                        checked={form.remove_default_og_image}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-slate-300 text-red-600"
                                    />
                                    Remove current social image
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Live crawler files
                        </h2>
                        <div className="mt-4 grid gap-3">
                            <a
                                href={endpoints.robots_url}
                                target="_blank"
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Open robots.txt
                            </a>
                            <a
                                href={endpoints.sitemap_url}
                                target="_blank"
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Open sitemap.xml
                            </a>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Save SEO settings
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
