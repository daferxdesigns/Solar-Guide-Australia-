import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface PageRow {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    excerpt?: string | null;
    updated_at?: string | null;
    public_url: string;
    is_homepage: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export default function Index({
    pages,
    filters,
    stats,
}: {
    pages: { data: PageRow[]; links: PaginationLink[] };
    filters: { search: string; status: string };
    stats: { total_pages: number; published_pages: number; draft_pages: number };
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = () => {
        router.get(
            '/admin/pages',
            { search, status },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Pages</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">WordPress-style pages</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                Create rich landing pages, support pages and custom content screens with a full editor, proper publishing workflow and a selectable homepage.
                            </p>
                        </div>
                        <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
                            <MetricCard label="Total" value={stats.total_pages} />
                            <MetricCard label="Published" value={stats.published_pages} />
                            <MetricCard label="Drafts" value={stats.draft_pages} />
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                                    placeholder="Search pages by title, slug or summary"
                                    className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="">All statuses</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Apply filters
                            </button>
                            <Link href="/admin/pages/create" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Add new page
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last edited</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pages.data.map((page) => (
                                    <tr key={page.id} className="align-top">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="text-base font-semibold text-slate-900">{page.title}</div>
                                                {page.is_homepage && (
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        Homepage
                                                    </span>
                                                )}
                                            </div>
                                            {page.excerpt && <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{page.excerpt}</p>}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">/pages/{page.slug}</td>
                                        <td className="px-6 py-5">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${page.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {page.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {page.updated_at ? new Date(page.updated_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-3 text-sm font-semibold">
                                                <Link href={`/admin/pages/${page.id}/edit`} className="text-emerald-700 hover:text-emerald-800">Edit</Link>
                                                <Link href={`/admin/pages/${page.id}/preview`} className="text-slate-700 hover:text-slate-900">Preview</Link>
                                                {page.status === 'published' && (
                                                    <a href={page.public_url} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-slate-900">View</a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm(`Delete "${page.title}"?`)) {
                                                            router.delete(`/admin/pages/${page.id}`);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pages.data.length === 0 && (
                        <div className="px-6 py-16 text-center text-sm text-slate-500">
                            No pages yet. Create your first custom page and you can even assign it as the site homepage.
                        </div>
                    )}
                </section>

                {pages.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pages.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    link.active
                                        ? 'bg-[#123524] text-white'
                                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MetricCard({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}
