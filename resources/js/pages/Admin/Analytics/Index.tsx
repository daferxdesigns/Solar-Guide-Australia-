import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/admin/analytics' },
];

export default function Index({
    range,
    stats,
    dailyTraffic,
    topArticles,
    clickTargets,
    devices,
    browsers,
    operatingSystems,
    referrers,
    topPages,
}: {
    range: string;
    stats: {
        page_views: number;
        article_views: number;
        unique_visitors: number;
        clicks: number;
        comment_submissions: number;
    };
    dailyTraffic: Array<{ date: string; label: string; views: number; clicks: number }>;
    topArticles: Array<{ title: string; slug?: string | null; views: number }>;
    clickTargets: Array<{ label: string; total: number }>;
    devices: Array<{ label: string; total: number }>;
    browsers: Array<{ label: string; total: number }>;
    operatingSystems: Array<{ label: string; total: number }>;
    referrers: Array<{ label: string; total: number }>;
    topPages: Array<{ label: string; total: number }>;
}) {
    const maxTraffic = Math.max(...dailyTraffic.map((item) => Math.max(item.views, item.clicks)), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">Track page views, article views, click events, referrers and device trends in a simple Google Analytics style overview.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['7', '7 days'],
                                ['30', '30 days'],
                                ['90', '90 days'],
                                ['365', '1 year'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => router.get('/admin/analytics', { range: value }, { preserveState: true, replace: true })}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${range === value ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
                    {[
                        ['Page views', stats.page_views],
                        ['Article views', stats.article_views],
                        ['Unique visitors', stats.unique_visitors],
                        ['Clicks', stats.clicks],
                        ['Comment submissions', stats.comment_submissions],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
                            <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900">Traffic over time</h2>
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

                    <section className="space-y-6">
                        <MetricList title="Top articles" items={topArticles.map((item) => ({ label: item.title, total: item.views }))} />
                        <MetricList title="Top pages" items={topPages} />
                    </section>
                </div>

                <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
                    <MetricList title="Click targets" items={clickTargets} />
                    <MetricList title="Devices" items={devices} />
                    <MetricList title="Browsers" items={browsers} />
                    <MetricList title="Operating systems" items={operatingSystems} />
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <MetricList title="Referrers" items={referrers} compact />
                </section>
            </div>
        </AppLayout>
    );
}

function MetricList({
    title,
    items,
    compact = false,
}: {
    title: string;
    items: Array<{ label: string; total: number }>;
    compact?: boolean;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <div className={`mt-4 space-y-3 ${compact ? 'max-h-[420px] overflow-auto pr-1' : ''}`}>
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={`${title}-${item.label}`} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 px-4 py-3 text-sm">
                            <span className="truncate pr-4 text-slate-700">{item.label}</span>
                            <span className="font-semibold text-slate-900">{item.total}</span>
                        </div>
                    ))
                ) : (
                    <div className="rounded-[1.25rem] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No data yet.</div>
                )}
            </div>
        </div>
    );
}
