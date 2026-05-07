import { PublicSiteHeader } from '@/components/public-site-header';
import { LocalLiveChat } from '@/components/local-live-chat';
import { PublicAdSlot } from '@/components/public-ad-slot';
import { PublicShareBar } from '@/components/public-share-bar';
import { PublicSiteFooter } from '@/components/public-site-footer';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { trackClickEvent } from '@/lib/analytics';
import { SharedData } from '@/types';

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    category?: { id: number; name: string; slug: string } | null;
}

interface PostComment {
    id: number;
    author_name: string;
    content: string;
    created_at?: string | null;
}

export default function Show({
    seo,
    post,
    categories,
    menus,
    relatedPosts,
    ads,
    footer,
}: {
    seo?: {
        title: string;
        description?: string | null;
        keywords?: string | null;
        canonical_url: string;
        image?: string | null;
        robots?: string | null;
    };
    post: {
        id: number;
        title: string;
        slug: string;
        excerpt?: string | null;
        seo_title?: string | null;
        seo_description?: string | null;
        seo_keywords?: string | null;
        canonical_url?: string | null;
        content: string;
        featured_image_url?: string | null;
        featured_image_alt?: string | null;
        header_background_mode?: 'color' | 'image' | 'none';
        header_background_color?: string | null;
        header_background_image_url?: string | null;
        header_background_image_position?: string | null;
        header_background_image_size?: string | null;
        header_background_image_repeat?: string | null;
        header_overlay_opacity?: number | null;
        published_at?: string | null;
        category?: { id: number; name: string; slug: string } | null;
        author?: { name: string } | null;
        comments: PostComment[];
        comments_count: number;
    };
    categories: { id: number; name: string; slug: string; published_posts_count?: number }[];
    menus: any[];
    relatedPosts: RelatedPost[];
    ads: {
        enabled: boolean;
        display_ads: boolean;
        publisher_id?: string | null;
        header_slot?: string | null;
        in_article_slot?: string | null;
        sidebar_slot?: string | null;
    };
    footer: {
        layout: any[];
        background_mode?: 'color' | 'image';
        background_color?: string | null;
        background_image_url?: string | null;
        background_image_position?: string | null;
        background_image_size?: string | null;
        background_image_repeat?: string | null;
    };
}) {
    const { flash } = usePage<SharedData>().props;
    const pageTitle = seo?.title || post.seo_title || post.title;
    const metaDescription = seo?.description || post.seo_description || post.excerpt || '';
    const canonicalUrl =
        seo?.canonical_url ||
        post.canonical_url ||
        (typeof window !== 'undefined' ? `${window.location.origin}/guides/${post.slug}` : `/guides/${post.slug}`);

    const form = useForm({
        author_name: '',
        author_email: '',
        content: '',
    });

    const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(`/guides/${post.slug}/comments`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title={pageTitle}>
                {metaDescription && <meta head-key="description" name="description" content={metaDescription} />}
                {(seo?.keywords || post.seo_keywords) && <meta head-key="keywords" name="keywords" content={seo?.keywords || post.seo_keywords || ''} />}
                {seo?.robots && <meta head-key="robots" name="robots" content={seo.robots} />}
                <link head-key="canonical" rel="canonical" href={canonicalUrl} />
                <meta head-key="og:title" property="og:title" content={pageTitle} />
                {metaDescription && <meta head-key="og:description" property="og:description" content={metaDescription} />}
                <meta head-key="og:type" property="og:type" content="article" />
                <meta head-key="og:url" property="og:url" content={canonicalUrl} />
                {(seo?.image || post.featured_image_url) && <meta head-key="og:image" property="og:image" content={seo?.image || post.featured_image_url || ''} />}
            </Head>

            <div className="min-h-screen bg-[#f5f6ef] text-slate-900">
                <header
                    className="text-white"
                    style={
                        post.header_background_mode === 'image' && post.header_background_image_url
                            ? {
                                  backgroundImage: `linear-gradient(rgba(18, 53, 36, ${(post.header_overlay_opacity ?? 72) / 100}), rgba(18, 53, 36, ${(post.header_overlay_opacity ?? 72) / 100})), url(${post.header_background_image_url})`,
                                  backgroundColor: post.header_background_color ?? '#123524',
                                  backgroundPosition: post.header_background_image_position ?? 'center center',
                                  backgroundSize: post.header_background_image_size ?? 'cover',
                                  backgroundRepeat: post.header_background_image_repeat ?? 'no-repeat',
                              }
                            : {
                                  backgroundColor: post.header_background_mode === 'none' ? '#123524' : (post.header_background_color ?? '#123524'),
                              }
                    }
                >
                    <PublicSiteHeader categories={categories} menus={menus} pageTitle={pageTitle} activeCategorySlug={post.category?.slug ?? null} postId={post.id} className="pb-2" />
                    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
                        <Link href="/guides" className="text-sm font-semibold text-[#b8db95]">
                            Back to all guides
                        </Link>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {post.category && (
                                <Link
                                    href={`/guides/category/${post.category.slug}`}
                                    onClick={() =>
                                        trackClickEvent({
                                            path: window.location.pathname,
                                            pageTitle,
                                            target: `article_category:${post.category?.slug}`,
                                            categorySlug: post.category?.slug,
                                            postSlug: post.slug,
                                        })
                                    }
                                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85"
                                >
                                    {post.category.name}
                                </Link>
                            )}
                        </div>
                        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">{post.title}</h1>
                        {post.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{post.excerpt}</p>}
                        <div className="mt-6 text-sm text-white/65">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                            {post.author?.name ? ` | ${post.author.name}` : ''}
                            {` | ${post.comments_count} comments`}
                        </div>
                    </div>
                </header>

                <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-10">
                    <div className="space-y-8">
                        <article className="rounded-[2rem] bg-white p-6 shadow-sm md:p-10">
                            {post.featured_image_url && (
                                <div className="mb-8 overflow-hidden rounded-[2rem] shadow-sm">
                                    <img src={post.featured_image_url} alt={post.featured_image_alt || post.title} className="h-[260px] w-full object-cover md:h-[420px]" />
                                </div>
                            )}
                            <div className="guide-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </article>

                        <PublicAdSlot
                            label="Article ad placement"
                            slot={ads.in_article_slot}
                            publisherId={ads.publisher_id}
                            enabled={ads.enabled}
                            displayAds={ads.display_ads}
                        />

                        <section id="comments" className="rounded-[2rem] bg-white p-6 shadow-sm md:p-10">
                            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900">Comments</h2>
                                    <p className="mt-2 text-sm text-slate-600">Join the discussion below. Comments appear after a quick review.</p>
                                </div>
                                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{post.comments_count} approved</div>
                            </div>

                            <form onSubmit={submitComment} className="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Name</label>
                                        <input
                                            type="text"
                                            value={form.data.author_name}
                                            onChange={(event) => form.setData('author_name', event.target.value)}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                            required
                                        />
                                        {form.errors.author_name && <p className="mt-2 text-sm text-red-600">{form.errors.author_name}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">Email</label>
                                        <input
                                            type="email"
                                            value={form.data.author_email}
                                            onChange={(event) => form.setData('author_email', event.target.value)}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                            required
                                        />
                                        {form.errors.author_email && <p className="mt-2 text-sm text-red-600">{form.errors.author_email}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Comment</label>
                                    <textarea
                                        value={form.data.content}
                                        onChange={(event) => form.setData('content', event.target.value)}
                                        rows={5}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Share your question, feedback, or troubleshooting note."
                                        required
                                    />
                                    {form.errors.content && <p className="mt-2 text-sm text-red-600">{form.errors.content}</p>}
                                </div>
                                {(flash?.success || form.recentlySuccessful) && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                        {flash?.success || 'Comment submitted. It will appear after admin approval.'}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36] disabled:opacity-60"
                                >
                                    {form.processing ? 'Submitting...' : 'Submit comment'}
                                </button>
                            </form>

                            <div className="mt-8 space-y-4">
                                {post.comments.length > 0 ? (
                                    post.comments.map((comment) => (
                                        <div key={comment.id} className="rounded-[1.5rem] border border-slate-200 px-5 py-4">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="font-semibold text-slate-900">{comment.author_name}</div>
                                                <div className="text-sm text-slate-500">
                                                    {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                                                </div>
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-slate-500">
                                        No approved comments yet. Be the first to leave one.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <PublicAdSlot
                            label="Sidebar ad placement"
                            slot={ads.sidebar_slot}
                            publisherId={ads.publisher_id}
                            enabled={ads.enabled}
                            displayAds={ads.display_ads}
                        />

                        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Need more help?</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Explore more articles on troubleshooting, setup, solar news and common questions from Australian households.
                            </p>
                            <Link
                                href="/guides"
                                onClick={() =>
                                    trackClickEvent({
                                        path: window.location.pathname,
                                        pageTitle,
                                        target: 'browse_all_guides',
                                        postSlug: post.slug,
                                    })
                                }
                                className="mt-5 inline-flex rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36]"
                            >
                                Browse all guides
                            </Link>
                        </div>

                        <PublicShareBar title={post.title} url={canonicalUrl} />

                        {relatedPosts.length > 0 && (
                            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900">Related articles</h2>
                                <div className="mt-4 space-y-4">
                                    {relatedPosts.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/guides/${related.slug}`}
                                            onClick={() =>
                                                trackClickEvent({
                                                    path: window.location.pathname,
                                                    pageTitle,
                                                    target: `related_article:${related.slug}`,
                                                    postSlug: related.slug,
                                                    categorySlug: related.category?.slug ?? undefined,
                                                })
                                            }
                                            className="block rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-slate-50"
                                        >
                                            <div className="text-sm font-semibold text-slate-900">{related.title}</div>
                                            <div className="mt-2 text-xs text-slate-500">{related.category?.name || 'Guide'}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </main>
                <PublicSiteFooter footer={footer} categories={categories} />
                <LocalLiveChat />
            </div>
        </>
    );
}
