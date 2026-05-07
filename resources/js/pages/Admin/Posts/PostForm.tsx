import RichTextEditor from '@/components/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

interface PostPayload {
    id: number | null;
    guide_category_id: number | null;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    is_featured: boolean;
    excerpt: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    canonical_url: string;
    content: string;
    featured_image_url: string | null;
    featured_image_alt: string;
    header_background_mode: 'color' | 'image' | 'none';
    header_background_color: string;
    header_background_image_url: string | null;
    header_background_image_position: string;
    header_background_image_size: 'cover' | 'contain' | 'auto' | '100% 100%';
    header_background_image_repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    header_overlay_opacity: number;
    published_at: string;
    analytics: {
        total_visits: number;
        unique_visitors: number;
        device_types: Array<{ label: string; visits: number }>;
        browsers: Array<{ label: string; visits: number }>;
        operating_systems: Array<{ label: string; visits: number }>;
        referrers: Array<{ label: string; visits: number }>;
    };
}

interface Props {
    pageTitle: string;
    heroTitle: string;
    submitLabel: string;
    breadcrumbs: BreadcrumbItem[];
    categories: CategoryOption[];
    post: PostPayload;
    submitUrl: string;
    method: 'post' | 'put';
}

type AnalyticsGroup = {
    label: string;
    items: Array<{ label: string; visits: number }>;
};

export default function PostForm({
    pageTitle,
    heroTitle,
    submitLabel,
    breadcrumbs,
    categories,
    post,
    submitUrl,
    method,
}: Props) {
    const analyticsGroups: AnalyticsGroup[] = [
        { label: 'Devices', items: post.analytics.device_types },
        { label: 'Browsers', items: post.analytics.browsers },
        { label: 'Operating systems', items: post.analytics.operating_systems },
        { label: 'Referrers', items: post.analytics.referrers },
    ];

    const [form, setForm] = useState({
        guide_category_id: post.guide_category_id ? String(post.guide_category_id) : '',
        title: post.title ?? '',
        slug: post.slug ?? '',
        status: post.status ?? 'draft',
        is_featured: Boolean(post.is_featured),
        excerpt: post.excerpt ?? '',
        seo_title: post.seo_title ?? '',
        seo_description: post.seo_description ?? '',
        seo_keywords: post.seo_keywords ?? '',
        canonical_url: post.canonical_url ?? '',
        content: post.content ?? '',
        featured_image_alt: post.featured_image_alt ?? '',
        header_background_mode: post.header_background_mode ?? 'color',
        header_background_color: post.header_background_color ?? '#123524',
        header_background_image_position: post.header_background_image_position ?? 'center center',
        header_background_image_size: post.header_background_image_size ?? 'cover',
        header_background_image_repeat: post.header_background_image_repeat ?? 'no-repeat',
        header_overlay_opacity: post.header_overlay_opacity ?? 72,
        published_at: post.published_at ?? '',
        remove_featured_image: false,
        remove_header_background_image: false,
        featured_image: null as File | null,
        header_background_image: null as File | null,
    });
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(post.featured_image_url);
    const [headerBackgroundPreview, setHeaderBackgroundPreview] = useState<string | null>(post.header_background_image_url);
    const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);

    const readingMinutes = useMemo(() => {
        const words = form.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 220));
    }, [form.content]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const { name, value } = target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setForm((current) => ({ ...current, [name]: target.checked }));
            return;
        }

        if (target instanceof HTMLInputElement && target.type === 'file') {
            if (name === 'header_background_image') {
                const file = target.files?.[0] ?? null;
                setForm((current) => ({
                    ...current,
                    header_background_image: file,
                    remove_header_background_image: false,
                }));
                setHeaderBackgroundPreview(file ? URL.createObjectURL(file) : post.header_background_image_url);
                return;
            }

            const file = target.files?.[0] ?? null;
            setForm((current) => ({
                ...current,
                featured_image: file,
                remove_featured_image: false,
            }));
            setFeaturedImagePreview(file ? URL.createObjectURL(file) : post.featured_image_url);
            return;
        }

        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            submitUrl,
            {
                ...form,
                guide_category_id: form.guide_category_id !== '' ? Number(form.guide_category_id) : null,
                is_featured: form.is_featured ? 1 : 0,
                remove_featured_image: form.remove_featured_image ? 1 : 0,
                remove_header_background_image: form.remove_header_background_image ? 1 : 0,
                _method: method === 'put' ? 'put' : undefined,
            },
            {
                forceFormData: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="space-y-6">
                <div className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-[#f7fbf3] via-white to-[#eef6ff] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">Solar Guide Admin</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{heroTitle}</h1>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                Publish installation guides, troubleshooting walkthroughs, and image-rich support articles for this website.
                            </p>
                        </div>
                        <div className="grid gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700 shadow-sm sm:grid-cols-2">
                            <div>
                                <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">Status</div>
                                <div className="mt-1 font-semibold capitalize">{form.status}</div>
                            </div>
                            <div>
                                <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">Read Time</div>
                                <div className="mt-1 font-semibold">{readingMinutes} min</div>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Post title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Example: Solar inverter communication faults explained"
                                        required
                                    />
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">URL slug</label>
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
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Category</label>
                                        <select
                                            name="guide_category_id"
                                            value={form.guide_category_id}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        >
                                            <option value="">No category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Excerpt</label>
                                    <textarea
                                        name="excerpt"
                                        value={form.excerpt}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Short summary used on the public guide homepage."
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Article content</h2>
                                    <p className="text-sm text-slate-500">
                                        Includes headings, bold, italic, font choice, alignment, lists, links, and pasted screenshots.
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {isUploadingInlineImage ? 'Uploading image...' : 'Editor ready'}
                                </div>
                            </div>
                            <RichTextEditor
                                value={form.content}
                                onChange={(value) => setForm((current) => ({ ...current, content: value }))}
                                placeholder="Write your solar guide here..."
                                minHeightClassName="min-h-[420px]"
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
                                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={form.is_featured}
                                        onChange={handleChange}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-800">Feature this article</span>
                                        <span className="text-xs text-slate-500">Featured posts get priority placement on the public homepage.</span>
                                    </span>
                                </label>
                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex flex-col gap-3">
                                        <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                            Save changes
                                        </button>
                                        <Link href="/admin/posts" className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                            Back to posts
                                        </Link>
                                        {post.slug && post.status === 'published' && (
                                            <a
                                                href={`/guides/${post.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                View article
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Featured image</h2>
                            <div className="mt-4 space-y-4">
                                <div className="overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50">
                                    {featuredImagePreview ? (
                                        <img
                                            src={featuredImagePreview}
                                            alt={form.featured_image_alt || form.title || 'Featured preview'}
                                            className="h-56 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-slate-500">
                                            Upload a hero image for your post cards and article banner.
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
                                    placeholder="Image alt text"
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
                            <h2 className="text-lg font-semibold text-slate-900">Header background</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Shape the article header with a solid color or a branded image, including WordPress-style fit and position controls.
                            </p>
                            <div className="mt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Background mode</label>
                                        <select
                                            name="header_background_mode"
                                            value={form.header_background_mode}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        >
                                            <option value="color">Color</option>
                                            <option value="image">Image</option>
                                            <option value="none">Minimal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Header color</label>
                                        <input
                                            type="color"
                                            name="header_background_color"
                                            value={form.header_background_color}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-2xl border border-slate-300 px-2 py-2"
                                        />
                                    </div>
                                </div>

                                <div
                                    className="overflow-hidden rounded-[1.75rem] border border-slate-200 px-6 py-8 text-white"
                                    style={
                                        form.header_background_mode === 'image' && headerBackgroundPreview
                                            ? {
                                                  backgroundImage: `linear-gradient(rgba(18, 53, 36, ${form.header_overlay_opacity / 100}), rgba(18, 53, 36, ${form.header_overlay_opacity / 100})), url(${headerBackgroundPreview})`,
                                                  backgroundColor: form.header_background_color,
                                                  backgroundPosition: form.header_background_image_position,
                                                  backgroundSize: form.header_background_image_size,
                                                  backgroundRepeat: form.header_background_image_repeat,
                                              }
                                            : {
                                                  backgroundColor: form.header_background_color,
                                              }
                                    }
                                >
                                    <div className="text-xs font-semibold tracking-[0.2em] text-white/75 uppercase">Live preview</div>
                                    <div className="mt-3 max-w-2xl font-serif text-3xl leading-tight">Your header can now feel editorial, branded, and much more dynamic.</div>
                                    <div className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                                        Balance the hero color, image fit, alignment, and overlay to match the article tone before publishing.
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    name="header_background_image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                                />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Image position</label>
                                        <select
                                            name="header_background_image_position"
                                            value={form.header_background_image_position}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        >
                                            {['left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom'].map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Image fit</label>
                                        <select
                                            name="header_background_image_size"
                                            value={form.header_background_image_size}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        >
                                            <option value="cover">Cover</option>
                                            <option value="contain">Contain</option>
                                            <option value="100% 100%">Fill</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Repeat</label>
                                        <select
                                            name="header_background_image_repeat"
                                            value={form.header_background_image_repeat}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        >
                                            <option value="no-repeat">No repeat</option>
                                            <option value="repeat">Repeat</option>
                                            <option value="repeat-x">Repeat X</option>
                                            <option value="repeat-y">Repeat Y</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Overlay strength: {form.header_overlay_opacity}%</label>
                                    <input
                                        type="range"
                                        name="header_overlay_opacity"
                                        min="0"
                                        max="100"
                                        value={form.header_overlay_opacity}
                                        onChange={handleChange}
                                        className="w-full accent-emerald-600"
                                    />
                                </div>

                                {headerBackgroundPreview && (
                                    <label className="flex items-center gap-3 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            name="remove_header_background_image"
                                            checked={form.remove_header_background_image}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-slate-300 text-red-600"
                                        />
                                        Remove current header background image
                                    </label>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">SEO</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Set search-friendly metadata similar to a WordPress SEO plugin.
                            </p>
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
                                        placeholder="Optional custom description for search results"
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
                                        placeholder="Comma-separated keywords, for example: solar inverter, installation guide, fault finding"
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
                                        placeholder="https://solar-guide-site.test/guides/example-article"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Traffic</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Visits</div>
                                    <div className="mt-2 text-3xl font-semibold text-slate-900">{post.analytics.total_visits}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Unique visitors</div>
                                    <div className="mt-2 text-3xl font-semibold text-slate-900">{post.analytics.unique_visitors}</div>
                                </div>
                            </div>
                            <div className="mt-5 space-y-4">
                                {analyticsGroups.map(({ label, items }) => (
                                    <div key={label}>
                                        <div className="mb-2 text-sm font-semibold text-slate-800">{label}</div>
                                        {items.length > 0 ? (
                                            <div className="space-y-2">
                                                {items.map((item) => (
                                                    <div key={`${label}-${item.label}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                                                        <span className="text-slate-700">{item.label}</span>
                                                        <span className="font-semibold text-slate-900">{item.visits}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                                                No data yet.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
