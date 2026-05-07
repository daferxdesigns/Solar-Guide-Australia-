import { SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';

interface FooterBlock {
    id: string;
    type: 'brand' | 'links' | 'categories' | 'subscribe' | 'text';
    title?: string;
    body?: string;
    enabled?: boolean;
    button_label?: string;
    limit?: number;
    items?: Array<{ label: string; url: string }>;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface FooterConfig {
    layout: FooterBlock[];
    background_mode?: 'color' | 'image';
    background_color?: string | null;
    background_image_url?: string | null;
    background_image_position?: string | null;
    background_image_size?: string | null;
    background_image_repeat?: string | null;
}

export function PublicSiteFooter({
    footer,
    categories,
}: {
    footer: FooterConfig;
    categories: Category[];
}) {
    const { flash } = usePage<SharedData>().props;
    const subscribeForm = useForm({
        name: '',
        email: '',
    });

    const blocks = footer.layout.filter((block) => block.enabled !== false);
    const gridColumns = blocks.length >= 4 ? 'lg:grid-cols-4' : blocks.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

    return (
        <footer
            id="site-footer"
            className="border-t border-slate-200"
            style={
                footer.background_mode === 'image' && footer.background_image_url
                    ? {
                          backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${footer.background_image_url})`,
                          backgroundPosition: footer.background_image_position ?? 'center center',
                          backgroundSize: footer.background_image_size ?? 'cover',
                          backgroundRepeat: footer.background_image_repeat ?? 'no-repeat',
                      }
                    : {
                          backgroundColor: footer.background_color ?? '#ffffff',
                      }
            }
        >
            <div className={`mx-auto grid max-w-7xl gap-8 px-6 py-10 ${gridColumns} lg:px-10`}>
                {blocks.map((block) => {
                    if (block.type === 'brand') {
                        return (
                            <div key={block.id}>
                                <div className="text-[11px] font-semibold tracking-[0.28em] text-[#14573e] uppercase">
                                    {block.title || 'Solar Support Australia'}
                                </div>
                                <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{block.body}</p>
                            </div>
                        );
                    }

                    if (block.type === 'links') {
                        return (
                            <div key={block.id}>
                                <div className="text-sm font-semibold text-slate-900">{block.title || 'Quick links'}</div>
                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                    {(block.items ?? []).map((item) => (
                                        <FooterHref key={`${block.id}-${item.label}`} href={item.url} label={item.label} />
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (block.type === 'categories') {
                        return (
                            <div key={block.id}>
                                <div className="text-sm font-semibold text-slate-900">{block.title || 'Popular categories'}</div>
                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                    {categories.slice(0, block.limit ?? 4).map((category) => (
                                        <Link key={category.id} href={`/guides/category/${category.slug}`} className="block transition hover:text-[#14573e]">
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (block.type === 'subscribe') {
                        return (
                            <div key={block.id} className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-5 shadow-sm">
                                <div className="text-sm font-semibold text-slate-900">{block.title || 'Subscribe'}</div>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{block.body}</p>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        subscribeForm.post('/subscribe', {
                                            preserveScroll: true,
                                            onSuccess: () => subscribeForm.reset(),
                                        });
                                    }}
                                    className="mt-4 space-y-3"
                                >
                                    <input
                                        value={subscribeForm.data.name}
                                        onChange={(event) => subscribeForm.setData('name', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Your name"
                                    />
                                    <input
                                        required
                                        type="email"
                                        value={subscribeForm.data.email}
                                        onChange={(event) => subscribeForm.setData('email', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Email address"
                                    />
                                    {(flash?.subscribe_success || subscribeForm.recentlySuccessful) && (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                            {flash?.subscribe_success || 'Thanks, you are subscribed.'}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={subscribeForm.processing}
                                        className="rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36] disabled:opacity-60"
                                    >
                                        {subscribeForm.processing ? 'Submitting...' : block.button_label || 'Subscribe'}
                                    </button>
                                </form>
                            </div>
                        );
                    }

                    return (
                        <div key={block.id}>
                            <div className="text-sm font-semibold text-slate-900">{block.title}</div>
                            <p className="mt-4 text-sm leading-7 text-slate-600">{block.body}</p>
                        </div>
                    );
                })}
            </div>
        </footer>
    );
}

function FooterHref({ href, label }: { href: string; label: string }) {
    const isAnchor = href.startsWith('#') || href.startsWith('/guides#');

    if (isAnchor) {
        return <a href={href} className="block transition hover:text-[#14573e]">{label}</a>;
    }

    return <Link href={href} className="block transition hover:text-[#14573e]">{label}</Link>;
}
