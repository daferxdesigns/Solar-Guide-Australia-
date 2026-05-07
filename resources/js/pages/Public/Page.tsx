import { LocalLiveChat } from '@/components/local-live-chat';
import { PublicSiteFooter } from '@/components/public-site-footer';
import { PublicSiteHeader } from '@/components/public-site-header';
import { Head } from '@inertiajs/react';

export default function PublicPage({
    page,
    seo,
    isHomepage,
    categories,
    menus,
    footer,
}: {
    page: any;
    seo: { title: string; description: string; keywords: string; canonical_url: string; image?: string | null; robots?: string | null };
    isHomepage: boolean;
    categories: any[];
    menus: any[];
    footer: any;
}) {
    return (
        <>
            <Head title={seo.title}>
                <meta head-key="description" name="description" content={seo.description} />
                <meta head-key="keywords" name="keywords" content={seo.keywords} />
                {seo.robots && <meta head-key="robots" name="robots" content={seo.robots} />}
                <link head-key="canonical" rel="canonical" href={seo.canonical_url} />
                <meta head-key="og:title" property="og:title" content={seo.title} />
                <meta head-key="og:description" property="og:description" content={seo.description} />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={seo.canonical_url} />
                {seo.image && <meta head-key="og:image" property="og:image" content={seo.image} />}
            </Head>

            <div className="min-h-screen bg-[#f5f6ef] text-slate-900">
                <section className="relative overflow-hidden bg-[#123524] text-white">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#f0a23b]/18 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#9fd4a8]/10 blur-3xl" />
                    </div>
                    <PublicSiteHeader categories={categories} menus={menus} pageTitle={seo.title} className="relative z-10" />

                    <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:pb-16">
                        <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#d9efc5] uppercase backdrop-blur-sm">
                            {isHomepage ? 'Current site homepage' : 'Custom page'}
                        </div>
                        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-6xl">{page.title}</h1>
                        {page.excerpt && <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">{page.excerpt}</p>}
                    </div>
                </section>

                <article className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                        {page.featured_image_url && (
                            <div className="px-6 pt-6 md:px-10 md:pt-10">
                                <img
                                    src={page.featured_image_url}
                                    alt={page.featured_image_alt || page.title}
                                    className="w-full rounded-[1.75rem] object-cover"
                                />
                            </div>
                        )}
                        <div className="px-6 py-10 md:px-10">
                            <div
                                className="guide-prose prose prose-slate max-w-none prose-headings:font-serif prose-a:text-emerald-700"
                                dangerouslySetInnerHTML={{ __html: page.content || '<p>This page is coming soon.</p>' }}
                            />
                        </div>
                    </div>
                </article>

                <PublicSiteFooter footer={footer} categories={categories} />
                <LocalLiveChat />
            </div>
        </>
    );
}
