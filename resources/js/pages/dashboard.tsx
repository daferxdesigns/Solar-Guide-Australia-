import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    stats,
    dailyTraffic,
    topPosts,
    recentComments,
}: {
    stats: {
        posts: number;
        published_posts: number;
        categories: number;
        comments_pending: number;
        users: number;
        visits_30d: number;
        unique_visitors_30d: number;
        clicks_30d: number;
    };
    dailyTraffic: Array<{
        date: string;
        label: string;
        views: number;
        clicks: number;
    }>;
    topPosts: Array<{
        id: number;
        title: string;
        slug: string;
        visits: number;
        category?: string | null;
    }>;
    recentComments: Array<{
        id: number;
        author_name: string;
        status: string;
        post_title?: string | null;
        created_at: string;
    }>;
}) {
    const maxTraffic = Math.max(...dailyTraffic.map((item) => Math.max(item.views, item.clicks)), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-[#123524] via-[#14573e] to-[#ee9f39] p-6 text-white shadow-sm xl:p-8">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] xl:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-emerald-100 uppercase">Website Admin</p>
                            <h1 className="mt-3 text-3xl font-semibold xl:text-4xl">Solar Support Australia admin dashboard</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/90 xl:text-base">
                                Manage content, track performance, monitor moderation, and keep the public website updated without touching SMS.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href="/admin/posts" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#14573e] transition hover:bg-emerald-50">
                                    Manage posts
                                </Link>
                                <Link href="/admin/analytics" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                    View analytics
                                </Link>
                                <Link href="/admin/settings/general" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                    Site settings
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-3 xl:grid-cols-1">
                            <div>
                                <div className="text-xs tracking-[0.16em] text-emerald-100 uppercase">30 day visits</div>
                                <div className="mt-2 text-2xl font-semibold">{stats.visits_30d}</div>
                            </div>
                            <div>
                                <div className="text-xs tracking-[0.16em] text-emerald-100 uppercase">Unique visitors</div>
                                <div className="mt-2 text-2xl font-semibold">{stats.unique_visitors_30d}</div>
                            </div>
                            <div>
                                <div className="text-xs tracking-[0.16em] text-emerald-100 uppercase">30 day clicks</div>
                                <div className="mt-2 text-2xl font-semibold">{stats.clicks_30d}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                    {[
                        ['Posts', stats.posts],
                        ['Published', stats.published_posts],
                        ['Categories', stats.categories],
                        ['Pending comments', stats.comments_pending],
                        ['Users', stats.users],
                        ['30 day visits', stats.visits_30d],
                        ['Unique visitors', stats.unique_visitors_30d],
                        ['30 day clicks', stats.clicks_30d],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
                            <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
                    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Traffic snapshot</h2>
                                <p className="mt-2 text-sm text-slate-500">Recent page views and click activity without horizontal scrolling on wide admin screens.</p>
                            </div>
                            <Link href="/admin/analytics" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                Open analytics
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            {dailyTraffic.map((item) => (
                                <div key={item.date} className="rounded-[1.5rem] border border-slate-200 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-800">{item.label}</span>
                                        <span className="text-slate-500">{item.views} views</span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max((item.views / maxTraffic) * 100, item.views > 0 ? 8 : 0)}%` }} />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                        <span>{item.clicks} clicks</span>
                                        <span>{item.views + item.clicks} total actions</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid gap-6">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900">Top articles</h2>
                            <div className="mt-4 space-y-3">
                                {topPosts.map((post) => (
                                    <div key={post.id} className="rounded-[1.5rem] border border-slate-200 px-4 py-3">
                                        <div className="text-sm font-semibold text-slate-900">{post.title}</div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                            <span>{post.category || 'No category'}</span>
                                            <span>{post.visits} visits</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">Recent comments</h2>
                                <Link href="/admin/comments" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                    Moderate
                                </Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {recentComments.map((comment) => (
                                    <div key={comment.id} className="rounded-[1.5rem] border border-slate-200 px-4 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-slate-900">{comment.author_name}</div>
                                            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${comment.status === 'pending' ? 'bg-amber-100 text-amber-800' : comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {comment.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500">{comment.post_title || 'Unknown article'}</div>
                                        <div className="mt-2 text-xs text-slate-400">{new Date(comment.created_at).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
