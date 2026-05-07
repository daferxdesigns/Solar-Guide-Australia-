import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChangeEvent, useState } from 'react';
import { usePage } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CommentRow {
    id: number;
    author_name: string;
    author_email: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string | null;
    approved_at?: string | null;
    post?: { id: number; title: string; slug: string } | null;
}

interface PostOption {
    id: number;
    title: string;
    slug: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comments', href: '/admin/comments' },
];

export default function Index({
    comments,
    filters,
    posts,
    stats,
}: {
    comments: {
        data: CommentRow[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
        status: string;
        post_id: string;
    };
    posts: PostOption[];
    stats: {
        total_comments: number;
        pending_comments: number;
        approved_comments: number;
        rejected_comments: number;
    };
}) {
    const { flash } = usePage<SharedData>().props;
    const [localFilters, setLocalFilters] = useState(filters);
    const [editingIds, setEditingIds] = useState<number[]>([]);

    const updateFilter = (key: 'search' | 'status' | 'post_id', value: string) => {
        const next = { ...localFilters, [key]: value };
        setLocalFilters(next);
        router.get('/admin/comments', next, { preserveState: true, replace: true });
    };

    const updateStatus = (id: number, status: CommentRow['status']) => {
        router.put(`/admin/comments/${id}`, { status }, { preserveScroll: true });
        setEditingIds((current) => current.filter((item) => item !== id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comments" />

            <div className="space-y-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-3xl font-semibold text-slate-900">Comment moderation</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600">
                        Review visitor comments, approve the good ones, and filter the queue by status or post.
                    </p>
                </section>

                {flash?.success && (
                    <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900">
                        {flash.success}
                    </section>
                )}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Total', stats.total_comments],
                        ['Pending', stats.pending_comments],
                        ['Approved', stats.approved_comments],
                        ['Rejected', stats.rejected_comments],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
                            <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_280px]">
                        <input
                            type="text"
                            value={localFilters.search}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => updateFilter('search', event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            placeholder="Search by author, email, or comment..."
                        />
                        <select
                            value={localFilters.status}
                            onChange={(event) => updateFilter('status', event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        >
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={localFilters.post_id}
                            onChange={(event) => updateFilter('post_id', event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        >
                            <option value="">All posts</option>
                            {posts.map((post) => (
                                <option key={post.id} value={post.id}>
                                    {post.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <section className="space-y-4">
                    {comments.data.map((comment) => (
                        <article key={comment.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-lg font-semibold text-slate-900">{comment.author_name}</h2>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                comment.status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : comment.status === 'rejected'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {comment.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-500">{comment.author_email}</div>
                                    {comment.post && (
                                        <div className="mt-3">
                                            <Link href={`/admin/posts/${comment.post.id}/edit`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                                {comment.post.title}
                                            </Link>
                                            <div className="mt-1 text-xs text-slate-500">/guides/{comment.post.slug}</div>
                                        </div>
                                    )}
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>
                                    <div className="mt-4 text-xs text-slate-500">
                                        Submitted {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                                        {comment.approved_at ? ` | Approved ${new Date(comment.approved_at).toLocaleString()}` : ''}
                                    </div>
                                </div>

                                <div className="grid w-full gap-2 lg:w-56">
                                    {comment.status === 'pending' || editingIds.includes(comment.id) ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(comment.id, 'approved')}
                                                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(comment.id, 'rejected')}
                                                className="rounded-2xl border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
                                            >
                                                Reject
                                            </button>
                                            {editingIds.includes(comment.id) && (
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(comment.id, 'pending')}
                                                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Mark pending
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                                            Current status: <span className="capitalize">{comment.status}</span>
                                        </div>
                                    )}
                                    {comment.status !== 'pending' && !editingIds.includes(comment.id) && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingIds((current) => [...current, comment.id])}
                                            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Delete comment from "${comment.author_name}"?`)) {
                                                router.delete(`/admin/comments/${comment.id}`, { preserveScroll: true });
                                            }
                                        }}
                                        className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {comments.data.length === 0 && (
                        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500">
                            No comments match the current filters.
                        </div>
                    )}
                </section>

                {comments.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {comments.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
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
