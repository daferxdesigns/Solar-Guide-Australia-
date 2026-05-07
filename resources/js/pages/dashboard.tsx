import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    CircleOff,
    ExternalLink,
    Mail,
    Megaphone,
    ShieldCheck,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type IntegrationState = 'active' | 'attention' | 'inactive';

type IntegrationCheck = {
    label: string;
    ok: boolean;
};

type IntegrationItem = {
    id: string;
    title: string;
    status: string;
    state: IntegrationState;
    description: string;
    href: string;
    facts: string[];
    checks: IntegrationCheck[];
};

type IntegrationHealth = {
    score: number;
    ready: number;
    total: number;
    items: IntegrationItem[];
};

const integrationIcons: Record<string, LucideIcon> = {
    adsense: Megaphone,
    mail: Mail,
    captcha: ShieldCheck,
    'ai-writer': BrainCircuit,
};

const stateStyles: Record<
    IntegrationState,
    {
        card: string;
        badge: string;
        icon: string;
        check: string;
    }
> = {
    active: {
        card: 'border-emerald-200 bg-emerald-50/70',
        badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
        icon: 'bg-emerald-600 text-white',
        check: 'text-emerald-600',
    },
    attention: {
        card: 'border-amber-200 bg-amber-50/70',
        badge: 'bg-amber-100 text-amber-800 ring-amber-200',
        icon: 'bg-amber-500 text-white',
        check: 'text-amber-600',
    },
    inactive: {
        card: 'border-slate-200 bg-white',
        badge: 'bg-slate-100 text-slate-700 ring-slate-200',
        icon: 'bg-slate-700 text-white',
        check: 'text-slate-400',
    },
};

export default function Dashboard({
    stats,
    integrationHealth,
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
    integrationHealth: IntegrationHealth;
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
    const readinessLabel = integrationHealth.score >= 85 ? 'Production ready' : integrationHealth.score >= 50 ? 'Almost there' : 'Needs setup';

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
                                <Link
                                    href="/admin/posts"
                                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#14573e] transition hover:bg-emerald-50"
                                >
                                    Manage posts
                                </Link>
                                <Link
                                    href="/admin/analytics"
                                    className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    View analytics
                                </Link>
                                <Link
                                    href="/admin/settings/general"
                                    className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
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

                <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <Sparkles className="h-5 w-5 text-[#f0a23b]" />
                            </div>
                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                                {readinessLabel}
                            </span>
                        </div>
                        <div className="mt-7">
                            <div className="text-xs font-semibold tracking-[0.2em] text-emerald-100 uppercase">Launch readiness</div>
                            <div className="mt-3 flex items-end gap-3">
                                <div className="text-5xl font-semibold">{integrationHealth.score}%</div>
                                <div className="pb-2 text-sm text-slate-300">
                                    {integrationHealth.ready} of {integrationHealth.total} systems active
                                </div>
                            </div>
                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-emerald-400 via-[#b8db95] to-[#f0a23b]"
                                    style={{ width: `${integrationHealth.score}%` }}
                                />
                            </div>
                            <p className="mt-5 text-sm leading-6 text-slate-300">
                                A quick control-room view for the services that affect revenue, form delivery, and spam protection.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {integrationHealth.items.map((item) => {
                            const Icon = integrationIcons[item.id] || Sparkles;
                            const StatusIcon = item.state === 'active' ? CheckCircle2 : item.state === 'attention' ? AlertTriangle : CircleOff;
                            const styles = stateStyles[item.state];

                            return (
                                <article key={item.id} className={`flex min-h-[330px] flex-col rounded-[2rem] border p-5 shadow-sm ${styles.card}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.icon}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles.badge}`}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="mt-5">
                                        <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                                        <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-600">{item.description}</p>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {item.facts.map((fact) => (
                                            <div
                                                key={fact}
                                                className="rounded-2xl bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-black/5"
                                            >
                                                {fact}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {item.checks.map((check) => (
                                            <div key={check.label} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                {check.ok ? (
                                                    <CheckCircle2 className={`h-4 w-4 ${styles.check}`} />
                                                ) : (
                                                    <CircleOff className="h-4 w-4 text-slate-400" />
                                                )}
                                                <span>{check.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={item.href}
                                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Open settings
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </article>
                            );
                        })}
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
                                <p className="mt-2 text-sm text-slate-500">
                                    Recent page views and click activity without horizontal scrolling on wide admin screens.
                                </p>
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
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{ width: `${Math.max((item.views / maxTraffic) * 100, item.views > 0 ? 8 : 0)}%` }}
                                        />
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
                                            <span
                                                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${comment.status === 'pending' ? 'bg-amber-100 text-amber-800' : comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                                            >
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
