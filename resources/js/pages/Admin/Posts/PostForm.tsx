import RichTextEditor from '@/components/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

interface AiAccountOption {
    id: number;
    name: string;
    model: string;
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
    schema_type: string;
    schema_custom_json: string;
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
    aiAccounts: AiAccountOption[];
    post: PostPayload;
    submitUrl: string;
    method: 'post' | 'put';
}

type AiDraft = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    featured_image_alt: string;
};

type AnalyticsGroup = {
    label: string;
    items: Array<{ label: string; visits: number }>;
};

const schemaTypes = [
    {
        value: 'Article',
        label: 'Article',
        description: 'Default for evergreen guides and general solar support articles.',
    },
    {
        value: 'BlogPosting',
        label: 'BlogPosting',
        description: 'Best for blog-style updates, opinions, and lighter editorial posts.',
    },
    {
        value: 'NewsArticle',
        label: 'NewsArticle',
        description: 'Use for timely solar policy, rebate, tariff, or industry news.',
    },
    {
        value: 'TechArticle',
        label: 'TechArticle',
        description: 'Use for technical inverter, Wi-Fi, monitoring, and troubleshooting content.',
    },
    {
        value: 'HowTo',
        label: 'HowTo',
        description: 'Use for step-by-step setup or repair workflows.',
    },
    {
        value: 'FAQPage',
        label: 'FAQPage',
        description: 'Use when the article is mainly questions and answers.',
    },
    {
        value: 'WebPage',
        label: 'WebPage',
        description: 'Use for a simple reference page that is not really an article.',
    },
];

export default function PostForm({ pageTitle, heroTitle, submitLabel, breadcrumbs, categories, aiAccounts, post, submitUrl, method }: Props) {
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
        schema_type: post.schema_type ?? 'Article',
        schema_custom_json: post.schema_custom_json ?? '',
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
    const [aiForm, setAiForm] = useState({
        ai_account_id: aiAccounts[0]?.id ? String(aiAccounts[0].id) : '',
        topic: post.title ?? '',
        keywords: post.seo_keywords ?? '',
        audience: 'Australian homeowners, solar customers, installers, and support teams',
        tone: 'Practical, clear, supportive',
        length: 'detailed',
        notes: '',
    });
    const [aiDraft, setAiDraft] = useState<AiDraft | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

    const readingMinutes = useMemo(() => {
        const words = form.content
            .replace(/<[^>]+>/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 220));
    }, [form.content]);

    const selectedSchema = useMemo(() => schemaTypes.find((type) => type.value === form.schema_type) ?? schemaTypes[0], [form.schema_type]);

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

    const handleAiChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setAiForm((current) => ({ ...current, [name]: value }));
    };

    const generateDraft = async () => {
        if (!aiForm.ai_account_id || !aiForm.topic.trim()) {
            setAiError('Choose an AI account and enter a topic first.');
            return;
        }

        setIsGeneratingDraft(true);
        setAiError(null);
        setAiDraft(null);

        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        try {
            const response = await fetch('/admin/posts/ai/generate', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ...aiForm,
                    ai_account_id: Number(aiForm.ai_account_id),
                    category_id: form.guide_category_id !== '' ? Number(form.guide_category_id) : null,
                    current_title: form.title,
                    current_excerpt: form.excerpt,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'AI generation failed.');
            }

            setAiDraft(payload.draft);
        } catch (error) {
            setAiError(error instanceof Error ? error.message : 'AI generation failed.');
        } finally {
            setIsGeneratingDraft(false);
        }
    };

    const applyDraft = (mode: 'all' | 'seo') => {
        if (!aiDraft) {
            return;
        }

        setForm((current) => ({
            ...current,
            ...(mode === 'all'
                ? {
                      title: aiDraft.title || current.title,
                      slug: aiDraft.slug || current.slug,
                      excerpt: aiDraft.excerpt || current.excerpt,
                      content: aiDraft.content || current.content,
                      featured_image_alt: aiDraft.featured_image_alt || current.featured_image_alt,
                  }
                : {}),
            seo_title: aiDraft.seo_title || current.seo_title,
            seo_description: aiDraft.seo_description || current.seo_description,
            seo_keywords: aiDraft.seo_keywords || current.seo_keywords,
        }));
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

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        AI drafting studio
                                    </div>
                                    <h2 className="mt-3 text-xl font-semibold text-slate-950">Draft this guide with ChatGPT</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                        Pick one saved OpenAI account, describe the article, then review the generated draft before applying it to the
                                        post fields.
                                    </p>
                                </div>
                                <Link
                                    href="/admin/settings/ai-writer"
                                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    AI accounts
                                </Link>
                            </div>

                            {aiAccounts.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                                    Add an OpenAI API account in AI Writer settings before generating drafts.
                                </div>
                            ) : (
                                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">AI account</label>
                                        <select
                                            name="ai_account_id"
                                            value={aiForm.ai_account_id}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        >
                                            {aiAccounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name} ({account.model})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Topic</label>
                                        <input
                                            name="topic"
                                            value={aiForm.topic}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                            placeholder="Example: Sungrow inverter Wi-Fi setup guide"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Target keywords</label>
                                        <input
                                            name="keywords"
                                            value={aiForm.keywords}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                            placeholder="solar inverter Wi-Fi, Sungrow setup, Australia"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Audience</label>
                                        <input
                                            name="audience"
                                            value={aiForm.audience}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Tone</label>
                                        <input
                                            name="tone"
                                            value={aiForm.tone}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Length</label>
                                        <select
                                            name="length"
                                            value={aiForm.length}
                                            onChange={handleAiChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        >
                                            <option value="short">Short</option>
                                            <option value="standard">Standard</option>
                                            <option value="detailed">Detailed</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Facts, product notes, or warnings</label>
                                        <textarea
                                            name="notes"
                                            value={aiForm.notes}
                                            onChange={handleAiChange}
                                            rows={4}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                            placeholder="Add the inverter brand, app name, exact steps you already know, safety warnings, or offers to avoid."
                                        />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <button
                                            type="button"
                                            onClick={generateDraft}
                                            disabled={isGeneratingDraft}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            <Wand2 className="h-4 w-4" />
                                            {isGeneratingDraft ? 'Generating draft...' : 'Generate draft'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="border-t border-slate-200 bg-slate-50 p-6 xl:border-t-0 xl:border-l">
                            {aiError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{aiError}</span>
                                    </div>
                                </div>
                            )}

                            {aiDraft ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Draft ready
                                        </div>
                                        <div className="mt-2 leading-6">{aiDraft.title}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Excerpt</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{aiDraft.excerpt}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <button
                                            type="button"
                                            onClick={() => applyDraft('all')}
                                            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            Apply full draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyDraft('seo')}
                                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Apply SEO only
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm leading-6 text-slate-500">
                                    Generated drafts will appear here first, so the editor only changes when you apply them.
                                </div>
                            )}
                        </aside>
                    </div>
                </section>

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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                            placeholder="Auto-generated if blank"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Category</label>
                                        <select
                                            name="guide_category_id"
                                            value={form.guide_category_id}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            Save changes
                                        </button>
                                        <Link
                                            href="/admin/posts"
                                            className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
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
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                    <div className="mt-3 max-w-2xl font-serif text-3xl leading-tight">
                                        Your header can now feel editorial, branded, and much more dynamic.
                                    </div>
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
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        >
                                            {[
                                                'left top',
                                                'center top',
                                                'right top',
                                                'left center',
                                                'center center',
                                                'right center',
                                                'left bottom',
                                                'center bottom',
                                                'right bottom',
                                            ].map((value) => (
                                                <option key={value} value={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Image fit</label>
                                        <select
                                            name="header_background_image_size"
                                            value={form.header_background_image_size}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        >
                                            <option value="no-repeat">No repeat</option>
                                            <option value="repeat">Repeat</option>
                                            <option value="repeat-x">Repeat X</option>
                                            <option value="repeat-y">Repeat Y</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                                        Overlay strength: {form.header_overlay_opacity}%
                                    </label>
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
                            <p className="mt-2 text-sm text-slate-500">Set search-friendly metadata similar to a WordPress SEO plugin.</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">SEO title</label>
                                    <input
                                        type="text"
                                        name="seo_title"
                                        value={form.seo_title}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
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
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                        placeholder="https://solar-guide-site.test/guides/example-article"
                                    />
                                </div>
                                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Schema type</label>
                                    <select
                                        name="schema_type"
                                        value={form.schema_type}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                    >
                                        {schemaTypes.map((schema) => (
                                            <option key={schema.value} value={schema.value}>
                                                {schema.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-3 text-xs leading-5 text-emerald-900">{selectedSchema.description}</p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Advanced schema JSON-LD fields</label>
                                    <textarea
                                        name="schema_custom_json"
                                        value={form.schema_custom_json}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-xs transition outline-none focus:border-emerald-500"
                                        placeholder={'{\n  "mainEntity": [],\n  "about": "Solar inverter troubleshooting"\n}'}
                                    />
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Optional JSON object merged into the generated schema. Use it for FAQ questions, HowTo steps, tools, supplies,
                                        or specific technical details.
                                    </p>
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
                                                    <div
                                                        key={`${label}-${item.label}`}
                                                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                                                    >
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
