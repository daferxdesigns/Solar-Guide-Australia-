import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Preview({
    page,
    isHomepage,
}: {
    page: any;
    isHomepage: boolean;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Preview', href: `/admin/pages/${page.id}/preview` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Preview ${page.title}`} />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">Page preview</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{page.title}</h1>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                This is the page presentation view without the editor controls.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href={`/admin/pages/${page.id}/edit`} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Back to editor
                            </Link>
                            {page.public_url && page.status === 'published' && (
                                <a href={page.public_url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Open public page
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="bg-[#123524] px-8 py-12 text-white md:px-12">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${page.status === 'published' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                                {page.status}
                            </span>
                            {isHomepage && (
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                                    Current homepage
                                </span>
                            )}
                        </div>
                        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-5xl">{page.title}</h2>
                        {page.excerpt && <p className="mt-4 max-w-3xl text-base leading-7 text-white/78">{page.excerpt}</p>}
                    </div>

                    {page.featured_image_url && (
                        <div className="mx-auto max-w-5xl px-6 pt-8 md:px-10">
                            <img
                                src={page.featured_image_url}
                                alt={page.featured_image_alt || page.title}
                                className="w-full rounded-[1.75rem] object-cover"
                            />
                        </div>
                    )}

                    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
                        <div
                            className="guide-prose prose prose-slate max-w-none prose-headings:font-serif prose-a:text-emerald-700"
                            dangerouslySetInnerHTML={{ __html: page.content || '<p>This page does not have content yet.</p>' }}
                        />
                    </div>
                </article>
            </div>
        </AppLayout>
    );
}
