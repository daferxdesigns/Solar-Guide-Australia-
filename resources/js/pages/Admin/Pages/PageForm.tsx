import RichTextEditor from '@/components/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

interface PagePayload {
    id: number | null;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    excerpt: string;
    content: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    canonical_url: string;
    featured_image_url: string | null;
    featured_image_alt: string;
    published_at: string;
    public_url?: string | null;
}

export default function PageForm({
    mode,
    page,
    breadcrumbs,
    isHomepage = false,
}: {
    mode: 'create' | 'edit';
    page: PagePayload;
    breadcrumbs: BreadcrumbItem[];
    isHomepage?: boolean;
}) {
    const [form, setForm] = useState({
        title: page.title ?? '',
        slug: page.slug ?? '',
        status: page.status ?? 'draft',
        excerpt: page.excerpt ?? '',
        content: page.content ?? '',
        seo_title: page.seo_title ?? '',
        seo_description: page.seo_description ?? '',
        seo_keywords: page.seo_keywords ?? '',
        canonical_url: page.canonical_url ?? '',
        featured_image_alt: page.featured_image_alt ?? '',
        published_at: page.published_at ?? '',
        remove_featured_image: false,
        featured_image: null as File | null,
    });
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(page.featured_image_url);
    const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);

    const readingMinutes = useMemo(() => {
        const words = form.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 220));
    }, [form.content]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        if (target instanceof HTMLInputElement && target.type === 'file') {
            const file = target.files?.[0] ?? null;
            setForm((current) => ({
                ...current,
                featured_image: file,
                remove_featured_image: false,
            }));
            setFeaturedImagePreview(file ? URL.createObjectURL(file) : page.featured_image_url);
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            mode === 'create' ? '/admin/pages' : `/admin/pages/${page.id}`,
            {
                ...form,
                remove_featured_image: form.remove_featured_image ? 1 : 0,
                _method: mode === 'edit' ? 'put' : undefined,
            },
            { forceFormData: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Add page' : `Edit ${page.title}`} />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-linear-to-br from-[#f8fbf4] via-white to-[#eef5ff] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">Pages</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                {mode === 'create' ? 'Create a new page' : 'Edit page'}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                A cleaner, WordPress-style full page editor with the writing space front and center, and publishing controls where you need them.
                            </p>
                        </div>
                        <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 text-sm text-slate-700 shadow-sm sm:grid-cols-3">
                            <MetricCard label="Status" value={form.status} />
                            <MetricCard label="Read time" value={`${readingMinutes} min`} />
                            <MetricCard label="Homepage" value={isHomepage ? 'Live' : 'No'} />
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Page title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Example: Solar battery rebates in Victoria"
                                        required
                                    />
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Permalink slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={form.slug}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                            placeholder="Auto-generated if blank"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Page summary</label>
                                        <input
                                            type="text"
                                            name="excerpt"
                                            value={form.excerpt}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                            placeholder="Short intro shown in previews and search snippets"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Page content</h2>
                                    <p className="text-sm text-slate-500">
                                        Write and shape the page directly here, with screenshots, headings, links and richer layouts.
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {isUploadingInlineImage ? 'Uploading image...' : 'Editor ready'}
                                </div>
                            </div>
                            <RichTextEditor
                                value={form.content}
                                onChange={(value) => setForm((current) => ({ ...current, content: value }))}
                                placeholder="Start building your page content..."
                                minHeightClassName="min-h-[560px]"
                                imageUploadUrl="/admin/posts/editor-image"
                                onUploadingChange={setIsUploadingInlineImage}
                            />
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Publishing</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Publish date</label>
                                    <input
                                        type="datetime-local"
                                        name="published_at"
                                        value={form.published_at}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    />
                                </div>
                                {page.public_url && (
                                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                        <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Public URL</div>
                                        <div className="mt-2 break-all font-medium text-slate-900">{page.public_url}</div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Featured image</h2>
                            <div className="mt-4 space-y-4">
                                <div className="overflow-hidden rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50">
                                    {featuredImagePreview ? (
                                        <img
                                            src={featuredImagePreview}
                                            alt={form.featured_image_alt || form.title || 'Featured image preview'}
                                            className="h-56 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-slate-500">
                                            Add a featured image to give the page a stronger opening visual.
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    name="featured_image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                                />
                                <input
                                    type="text"
                                    name="featured_image_alt"
                                    value={form.featured_image_alt}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    placeholder="Alt text for the image"
                                />
                                {featuredImagePreview && (
                                    <label className="flex items-center gap-3 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            name="remove_featured_image"
                                            checked={form.remove_featured_image}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-slate-300 text-red-600"
                                        />
                                        Remove current featured image
                                    </label>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">SEO</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">SEO title</label>
                                    <input
                                        type="text"
                                        name="seo_title"
                                        value={form.seo_title}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Optional custom title tag"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Meta description</label>
                                    <textarea
                                        name="seo_description"
                                        value={form.seo_description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">SEO keywords</label>
                                    <textarea
                                        name="seo_keywords"
                                        value={form.seo_keywords}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Canonical URL</label>
                                    <input
                                        type="url"
                                        name="canonical_url"
                                        value={form.canonical_url}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="https://example.com/pages/your-page"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                    {mode === 'create' ? 'Create page' : 'Update page'}
                                </button>
                                <Link href="/admin/pages" className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Back to pages
                                </Link>
                                {page.id && (
                                    <Link href={`/admin/pages/${page.id}/preview`} className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                        Preview page
                                    </Link>
                                )}
                                {page.public_url && page.status === 'published' && (
                                    <a
                                        href={page.public_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        View public page
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}
