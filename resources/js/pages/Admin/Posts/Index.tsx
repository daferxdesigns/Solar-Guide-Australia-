import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownUp } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PostRow {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    is_featured: boolean;
    excerpt?: string | null;
    featured_image_url?: string | null;
    visits_count: number;
    unique_visitors_count: number;
    comments_count: number;
    pending_comments_count: number;
    published_at?: string | null;
    category?: { id: number; name: string; slug: string } | null;
    author?: { name: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/admin/posts' },
];

export default function Index({
    posts,
    filters,
    stats,
}: {
    posts: {
        data: PostRow[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
        status: string;
        sort: string;
        direction: 'asc' | 'desc';
    };
    stats: {
        total_posts: number;
        published_posts: number;
        draft_posts: number;
        categories: number;
    };
}) {
    const [localFilters, setLocalFilters] = useState(filters);

    const updateFilter = (patch: Partial<typeof localFilters>) => {
        const next = { ...localFilters, ...patch };
        setLocalFilters(next);
        router.get('/admin/posts', next, { preserveState: true, replace: true });
    };

    const toggleSort = (column: string) => {
        const direction = localFilters.sort === column && localFilters.direction === 'asc' ? 'desc' : 'asc';
        updateFilter({ sort: column, direction });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guide Posts" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-[#0f3f2d] via-[#14573e] to-[#ee9f39] p-6 text-white shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-emerald-100 uppercase">Website Admin</p>
                            <h1 className="mt-2 text-3xl font-semibold">Solar Support Australia content hub</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/90">
                                Manage public solar installation guides, troubleshooting articles, featured images, categories, article traffic and moderation signals.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/posts/create" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#14573e] transition hover:bg-emerald-50">
                                New post
                            </Link>
                            <Link href="/admin/categories" className="rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                Categories
                            </Link>
                            <a href="/guides" target="_blank" rel="noreferrer" className="rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                Public site
                            </a>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Total posts', stats.total_posts],
                        ['Published', stats.published_posts],
                        ['Drafts', stats.draft_posts],
                        ['Categories', stats.categories],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
                            <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <input
                            type="text"
                            value={localFilters.search}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => updateFilter({ search: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="Search by title, slug, or excerpt..."
                        />
                        <select
                            value={localFilters.status}
                            onChange={(event) => updateFilter({ status: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        >
                            <option value="">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </section>

                <section className="space-y-4 2xl:hidden">
                    {posts.data.map((post) => (
                        <article key={post.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                <div className="flex min-w-0 flex-1 gap-4">
                                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 max-sm:hidden">
                                        {post.featured_image_url && <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-start gap-2">
                                            <h2 className="line-clamp-2 min-w-0 flex-1 text-lg font-semibold text-slate-900">{post.title}</h2>
                                            {post.is_featured && <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Featured</span>}
                                        </div>
                                        <div className="mt-1 break-all text-xs text-slate-500">/guides/{post.slug}</div>
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt || 'No excerpt yet.'}</p>
                                    </div>
                                </div>

                                <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[34rem] xl:grid-cols-2">
                                    <StatCard label="Category" value={post.category?.name || 'No category'} />
                                    <StatCard label="Status" value={post.status} />
                                    <StatCard label="Traffic" value={`${post.visits_count} visits`} subvalue={`${post.unique_visitors_count} unique`} />
                                    <StatCard label="Comments" value={`${post.comments_count} total`} subvalue={`${post.pending_comments_count} pending`} />
                                    <StatCard label="Published" value={post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'} />
                                    <StatCard label="Author" value={post.author?.name || 'Unknown'} />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link href={`/admin/posts/${post.id}/edit`} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Edit
                                </Link>
                                <a href={`/guides/${post.slug}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                    View
                                </a>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                                            router.delete(`/admin/posts/${post.id}`);
                                        }
                                    }}
                                    className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm 2xl:block">
                    <div className="overflow-x-auto 2xl:overflow-x-visible">
                        <table className="min-w-full table-fixed divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    <th className="w-[31%] px-6 py-4">Article</th>
                                    <SortableHeader label="Category" active={localFilters.sort === 'category'} direction={localFilters.direction} onClick={() => toggleSort('category')} className="w-[13%] px-4 py-4" />
                                    <SortableHeader label="Status" active={localFilters.sort === 'status'} direction={localFilters.direction} onClick={() => toggleSort('status')} className="w-[10%] px-4 py-4" />
                                    <SortableHeader label="Traffic" active={localFilters.sort === 'traffic'} direction={localFilters.direction} onClick={() => toggleSort('traffic')} className="w-[12%] px-4 py-4" />
                                    <SortableHeader label="Comments" active={localFilters.sort === 'comments'} direction={localFilters.direction} onClick={() => toggleSort('comments')} className="w-[12%] px-4 py-4" />
                                    <th className="w-[9%] px-4 py-4">Author</th>
                                    <SortableHeader label="Published" active={localFilters.sort === 'published'} direction={localFilters.direction} onClick={() => toggleSort('published')} className="w-[8%] px-4 py-4" />
                                    <th className="w-[5%] px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posts.data.map((post) => (
                                    <tr key={post.id} className="align-top">
                                        <td className="px-6 py-5">
                                            <div className="flex gap-4">
                                                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                    {post.featured_image_url && <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-start gap-2">
                                                        <div className="line-clamp-2 min-w-0 text-sm font-semibold text-slate-900">{post.title}</div>
                                                        {post.is_featured && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Featured</span>}
                                                    </div>
                                                    <div className="mt-1 break-all text-xs text-slate-500">/guides/{post.slug}</div>
                                                    <p className="mt-2 line-clamp-2 max-w-full text-sm text-slate-600">{post.excerpt || 'No excerpt yet.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-700">{post.category?.name || 'No category'}</td>
                                        <td className="px-4 py-5">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-700">
                                            <div className="font-semibold text-slate-900">{post.visits_count} visits</div>
                                            <div className="mt-1 text-xs text-slate-500">{post.unique_visitors_count} unique</div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-700">
                                            <div className="font-semibold text-slate-900">{post.comments_count} comments</div>
                                            <div className="mt-1 text-xs text-slate-500">{post.pending_comments_count} pending</div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-700">{post.author?.name || 'Unknown'}</td>
                                        <td className="px-4 py-5 text-sm text-slate-700">{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Link href={`/admin/posts/${post.id}/edit`} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                                    Edit
                                                </Link>
                                                <a href={`/guides/${post.slug}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                                    View
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {posts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-14 text-center text-sm text-slate-500">
                                            No posts found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {posts.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-[2rem] border border-slate-200 bg-white px-6 py-4 shadow-sm">
                        {posts.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SortableHeader({
    label,
    active,
    direction,
    onClick,
    className,
}: {
    label: string;
    active: boolean;
    direction: 'asc' | 'desc';
    onClick: () => void;
    className?: string;
}) {
    return (
        <th className={className}>
            <button
                type="button"
                onClick={onClick}
                className={`inline-flex items-center gap-2 transition ${active ? 'text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span>{label}</span>
                <ArrowDownUp className={`h-3.5 w-3.5 ${active && direction === 'asc' ? 'rotate-180' : ''}`} />
            </button>
        </th>
    );
}

function StatCard({
    label,
    value,
    subvalue,
}: {
    label: string;
    value: string;
    subvalue?: string;
}) {
    return (
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
            {subvalue && <div className="mt-1 text-xs text-slate-500">{subvalue}</div>}
        </div>
    );
}
