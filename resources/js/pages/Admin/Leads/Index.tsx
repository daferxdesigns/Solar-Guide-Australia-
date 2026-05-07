import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChangeEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leads', href: '/admin/leads' },
];

interface LeadRow {
    id: number;
    source: string;
    form_name?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address_line_1?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
    message?: string | null;
    payload?: Record<string, unknown> | null;
    result_summary?: Record<string, unknown> | null;
    emailed_at?: string | null;
    created_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export default function Index({
    leads,
    filters,
    stats,
}: {
    leads: {
        data: LeadRow[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
        source: string;
    };
    stats: {
        total_leads: number;
        calculator_leads: number;
        contact_leads: number;
        chat_leads: number;
        subscribe_leads: number;
        emailed_results: number;
    };
}) {
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const updateFilters = (patch: Partial<typeof filters>) => {
        router.get('/admin/leads', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-cyan-100 bg-linear-to-br from-[#0d2d43] via-[#13536f] to-[#f2a541] p-6 text-white shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.22em] text-cyan-100 uppercase">Public enquiries</p>
                    <h1 className="mt-2 text-3xl font-semibold">Lead capture</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-50/90">
                        Review calculator requests and contact enquiries submitted by visitors, with names, emails, addresses and estimate details stored in one place.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total leads" value={stats.total_leads} />
                    <StatCard label="Calculator leads" value={stats.calculator_leads} />
                    <StatCard label="Contact enquiries" value={stats.contact_leads} />
                    <StatCard label="Chat starts" value={stats.chat_leads} />
                    <StatCard label="Subscribers" value={stats.subscribe_leads} />
                    <StatCard label="Results emailed" value={stats.emailed_results} />
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                        <input
                            type="text"
                            defaultValue={filters.search}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => updateFilters({ search: event.target.value })}
                            placeholder="Search by name, email, address or postcode..."
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        />
                        <select
                            value={filters.source}
                            onChange={(event) => updateFilters({ source: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        >
                            <option value="">All sources</option>
                            <option value="solar_calculator">Solar calculator</option>
                            <option value="contact_enquiry">Contact enquiry</option>
                            <option value="live_chat">Live chat</option>
                            <option value="footer_subscribe">Footer subscribe</option>
                            <option value="comment_submission">Article comment</option>
                        </select>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            ['csv', 'Export CSV'],
                            ['xls', 'Export XLS'],
                            ['txt', 'Export Text'],
                        ].map(([format, label]) => (
                            <a
                                key={format}
                                href={`/admin/leads/export/${format}?search=${encodeURIComponent(filters.search)}&source=${encodeURIComponent(filters.source)}`}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    {leads.data.map((lead) => (
                        <article key={lead.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-xl font-semibold text-slate-900">{lead.name}</h2>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {lead.form_name || humanize(lead.source)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                                        <span>{lead.email}</span>
                                        {lead.phone && <span>{lead.phone}</span>}
                                        <span>{[lead.address_line_1, lead.suburb, lead.state, lead.postcode].filter(Boolean).join(', ')}</span>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 xl:w-72">
                                    <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Submitted</div>
                                    <div className="mt-2 font-semibold text-slate-900">{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</div>
                                    {lead.emailed_at && (
                                        <>
                                            <div className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Result emailed</div>
                                            <div className="mt-2 font-semibold text-slate-900">{new Date(lead.emailed_at).toLocaleString()}</div>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLeadId((current) => (current === lead.id ? null : lead.id))}
                                        className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                                    >
                                        {selectedLeadId === lead.id ? 'Hide details' : 'View details'}
                                    </button>
                                </div>
                            </div>

                            {selectedLeadId === lead.id && (
                                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                    {lead.message && (
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 lg:col-span-2">
                                            <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Message</div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.message}</p>
                                        </div>
                                    )}
                                    {lead.payload && (
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                                            <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Submitted inputs</div>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                {Object.entries(lead.payload).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between gap-3">
                                                        <span className="text-slate-500">{humanize(key)}</span>
                                                        <span className="font-semibold text-slate-900">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {lead.result_summary && (
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                                            <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Estimate summary</div>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                {Object.entries(lead.result_summary).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between gap-3">
                                                        <span className="text-slate-500">{humanize(key)}</span>
                                                        <span className="font-semibold text-slate-900">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}

                    {leads.data.length === 0 && (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
                            No leads found for the current filters.
                        </div>
                    )}
                </section>

                {leads.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-[2rem] border border-slate-200 bg-white px-6 py-4 shadow-sm">
                        {leads.links.map((link, index) => (
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

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}

function humanize(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
