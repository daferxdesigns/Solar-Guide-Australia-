import { PublicSiteHeader } from '@/components/public-site-header';
import { LocalLiveChat } from '@/components/local-live-chat';
import { PublicAdSlot } from '@/components/public-ad-slot';
import { PublicSiteFooter } from '@/components/public-site-footer';
import { trackClickEvent } from '@/lib/analytics';
import { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Wifi, Sun, Battery, BookOpen } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    published_posts_count?: number;
}

interface PostCard {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image_url?: string | null;
    featured_image_alt?: string | null;
    published_at?: string | null;
    is_featured?: boolean;
    category?: Category | null;
    author?: { name: string } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export default function Index({
    hero,
    seo,
    featuredPost,
    posts,
    categories,
    menus,
    activeCategory,
    ads,
    footer,
}: {
    hero: {
        title: string;
        subtitle: string;
        background_image_url?: string | null;
    };
    seo: {
        title: string;
        description: string;
        keywords: string;
        canonical_url: string;
        image?: string | null;
        robots?: string | null;
    };
    featuredPost?: PostCard | null;
    posts: {
        data: PostCard[];
        links: PaginationLink[];
    };
    categories: Category[];
    menus: any[];
    activeCategory?: { id: number; name: string; slug: string } | null;
    ads: {
        enabled: boolean;
        display_ads: boolean;
        publisher_id?: string | null;
        header_slot?: string | null;
        in_article_slot?: string | null;
        sidebar_slot?: string | null;
    };
    footer: {
        layout: any[];
        background_mode?: 'color' | 'image';
        background_color?: string | null;
        background_image_url?: string | null;
        background_image_position?: string | null;
        background_image_size?: string | null;
        background_image_repeat?: string | null;
    };
}) {
    const { flash } = usePage<SharedData>().props;

    const calculatorForm = useForm({
        name: '',
        email: '',
        phone: '',
        address_line_1: '',
        suburb: '',
        state: 'VIC',
        postcode: '',
        system_size_kw: '6.6',
        average_daily_usage_kwh: '18',
        electricity_rate: '0.32',
        feed_in_tariff: '0.06',
    });

    const contactForm = useForm({
        name: '',
        email: '',
        phone: '',
        address_line_1: '',
        suburb: '',
        state: 'VIC',
        postcode: '',
        message: '',
    });

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
                <section
                    className="relative overflow-hidden bg-[#123524] text-white"
                    style={
                        hero.background_image_url
                            ? {
                                  backgroundImage: `linear-gradient(rgba(18, 53, 36, 0.84), rgba(20, 87, 62, 0.72)), url(${hero.background_image_url})`,
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundRepeat: 'no-repeat',
                              }
                            : undefined
                    }
                >
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#f0a23b]/18 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#9fd4a8]/10 blur-3xl" />
                    </div>
                    <PublicSiteHeader categories={categories} menus={menus} pageTitle={seo.title} activeCategorySlug={activeCategory?.slug ?? null} />

                    <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:min-h-[38rem] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-10 lg:pb-16">
                        <div>
                            <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#d9efc5] uppercase backdrop-blur-sm">
                                Australia-focused solar support and troubleshooting
                            </div>
                            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-6xl">{hero.title}</h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">{hero.subtitle}</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="#articles"
                                    onClick={() =>
                                        trackClickEvent({
                                            path: window.location.pathname,
                                            pageTitle: seo.title,
                                            target: 'browse_articles',
                                        })
                                    }
                                    className="rounded-full bg-[#f0a23b] px-6 py-3 text-sm font-semibold text-[#17331f] transition hover:bg-[#f8bb62]"
                                >
                                    Browse articles
                                </a>
                                <a href="#contact" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                    Contact the team
                                </a>
                            </div>
                            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                                {[
                                    ['Installer-minded', 'Built around real support questions instead of quote-chasing copy.'],
                                    ['Brand-specific', 'Guides for Solis, Delta, Solplanet, AlphaESS, SOFAR and SAJ.'],
                                    ['Australia-based', 'Local rebates, tariffs and practical solar updates that matter here.'],
                                ].map(([title, body]) => (
                                    <div key={title} className="rounded-[1.5rem] border border-white/10 bg-black/12 p-4 backdrop-blur-sm">
                                        <div className="text-sm font-semibold text-white">{title}</div>
                                        <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                ['Install tips', 'Step-by-step notes for panels, inverters, batteries and monitoring handover.'],
                                ['Fault finding', 'Fast walkthroughs for alarms, Wi-Fi issues, offline logger errors and low yield.'],
                                ['Australian updates', 'Battery rebates, feed-in tariffs and policy changes that affect households.'],
                                ['Popular topics', 'Clear guides homeowners can use when comparing options or resolving common issues.'],
                            ].map(([title, body]) => (
                                <div key={title} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                                    <div className="text-lg font-semibold">{title}</div>
                                    <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-2 lg:px-10">
                    <PublicAdSlot
                        label="Homepage banner"
                        slot={ads.header_slot}
                        publisherId={ads.publisher_id}
                        enabled={ads.enabled}
                        displayAds={ads.display_ads}
                    />
                </section>

                {!activeCategory && <section id="solar-calculator" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-[2rem] bg-[#123524] p-8 text-white shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.22em] text-[#b8db95] uppercase">Solar calculator</p>
                            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">Estimate solar production and savings for your home.</h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">
                                Enter your details below and we will calculate a simple production and savings estimate based on your system size, usage and location. A copy of the result is also sent to your email.
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {[
                                    ['Fast estimate', 'A quick guide for expected annual generation and bill savings.'],
                                    ['Email copy', 'A summary is sent to the email address you enter.'],
                                    ['No guesswork', 'Built around state-based solar yield assumptions and your own inputs.'],
                                ].map(([title, body]) => (
                                    <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                                        <div className="text-sm font-semibold text-white">{title}</div>
                                        <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                calculatorForm.post('/solar-calculator', { preserveScroll: true });
                            }}
                            className="rounded-[2rem] bg-white p-6 shadow-sm"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <InputField required label="Full name" value={calculatorForm.data.name} onChange={(value) => calculatorForm.setData('name', value)} error={calculatorForm.errors.name} />
                                <InputField required label="Email address" type="email" value={calculatorForm.data.email} onChange={(value) => calculatorForm.setData('email', value)} error={calculatorForm.errors.email} />
                                <InputField required label="Phone" value={calculatorForm.data.phone} onChange={(value) => calculatorForm.setData('phone', value)} error={calculatorForm.errors.phone} />
                                <InputField required label="Street address" value={calculatorForm.data.address_line_1} onChange={(value) => calculatorForm.setData('address_line_1', value)} error={calculatorForm.errors.address_line_1} />
                                <InputField required label="Suburb" value={calculatorForm.data.suburb} onChange={(value) => calculatorForm.setData('suburb', value)} error={calculatorForm.errors.suburb} />
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">State</label>
                                    <select
                                        required
                                        value={calculatorForm.data.state}
                                        onChange={(event) => calculatorForm.setData('state', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    >
                                        {['NSW', 'VIC', 'QLD', 'SA', 'WA', 'ACT', 'TAS', 'NT'].map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {calculatorForm.errors.state && <p className="mt-2 text-sm text-red-600">{calculatorForm.errors.state}</p>}
                                </div>
                                <InputField required label="Postcode" value={calculatorForm.data.postcode} onChange={(value) => calculatorForm.setData('postcode', value)} error={calculatorForm.errors.postcode} />
                                <InputField required label="System size (kW)" type="number" step="0.1" value={calculatorForm.data.system_size_kw} onChange={(value) => calculatorForm.setData('system_size_kw', value)} error={calculatorForm.errors.system_size_kw} />
                                <InputField required label="Average daily usage (kWh)" type="number" step="0.1" value={calculatorForm.data.average_daily_usage_kwh} onChange={(value) => calculatorForm.setData('average_daily_usage_kwh', value)} error={calculatorForm.errors.average_daily_usage_kwh} />
                                <InputField required label="Electricity rate ($/kWh)" type="number" step="0.01" value={calculatorForm.data.electricity_rate} onChange={(value) => calculatorForm.setData('electricity_rate', value)} error={calculatorForm.errors.electricity_rate} />
                                <InputField required label="Feed-in tariff ($/kWh)" type="number" step="0.01" value={calculatorForm.data.feed_in_tariff} onChange={(value) => calculatorForm.setData('feed_in_tariff', value)} error={calculatorForm.errors.feed_in_tariff} />
                            </div>

                            {flash?.calculator_success && (
                                <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                                    <div className="text-sm font-semibold text-emerald-900">{flash.calculator_success}</div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={calculatorForm.processing}
                                    className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36] disabled:opacity-60"
                                >
                                    {calculatorForm.processing ? 'Calculating...' : 'Get my estimate'}
                                </button>
                                <p className="self-center text-sm text-slate-500">Estimate only. Final output depends on roof design, shading, equipment and tariff structure.</p>
                            </div>
                        </form>
                    </div>
                </section>}

                {!activeCategory && <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.22em] text-[#14573e] uppercase">Trusted Solar Advice</p>
                            <h2 className="mt-3 font-serif text-3xl leading-tight text-slate-900 md:text-4xl">Clear answers for Australian homes, batteries and inverters.</h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                                Whether you are reconnecting an inverter, comparing battery options or trying to understand the latest rebate changes, the goal is simple: give you practical guidance that is easier to trust and easier to use.
                            </p>
                            <div className="mt-6 space-y-4">
                                {[
                                    'Step-by-step troubleshooting for Wi-Fi dropouts, inverter alarms, offline monitoring and low production checks.',
                                    'Straightforward news and policy explainers covering rebates, tariffs and other solar updates across Australia.',
                                    'Easy category browsing so you can jump from brand-specific help to broader solar guidance in one place.',
                                ].map((item) => (
                                    <div key={item} className="flex gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f0a23b]" />
                                        <p className="text-sm leading-6 text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                {
                                    title: 'Wi-Fi setup guides',
                                    body: 'Brand-by-brand connection guides for monitoring sticks, apps and local Wi-Fi setup.',
                                    icon: Wifi,
                                    imageUrl: 'https://illustrations.popsy.co/white/smart-home.svg',
                                    color: '#123524',
                                    textColor: 'white',
                                    accentColor: '#d9efc5'
                                },
                                {
                                    title: 'Solar news',
                                    body: 'Explainers covering rebates, free electricity programs and other Australia-focused updates.',
                                    icon: Sun,
                                    imageUrl: 'https://illustrations.popsy.co/white/news.svg',
                                    color: 'white',
                                    textColor: 'slate-900',
                                    accentColor: '#14573e'
                                },
                                {
                                    title: 'Battery and inverter help',
                                    body: 'Useful guidance for system owners comparing brands, features and everyday setup questions.',
                                    icon: Battery,
                                    imageUrl: 'https://illustrations.popsy.co/white/energy.svg',
                                    color: '#123524',
                                    textColor: 'white',
                                    accentColor: '#d9efc5'
                                },
                                {
                                    title: 'Helpful reading',
                                    body: 'Fresh articles, practical explainers and support topics people actually search for.',
                                    icon: BookOpen,
                                    imageUrl: 'https://illustrations.popsy.co/white/books.svg',
                                    color: 'white',
                                    textColor: 'slate-900',
                                    accentColor: '#14573e'
                                },
                            ].map(({ title, body, icon: Icon, imageUrl, color, textColor, accentColor }) => (
                                <div
                                    key={title}
                                    className={`group relative overflow-hidden rounded-[2rem] p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full flex flex-col`}
                                    style={{ backgroundColor: color }}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors group-hover:scale-110`}
                                            style={{ backgroundColor: `${accentColor}20` }}
                                        >
                                            <Icon
                                                size={20}
                                                style={{ color: accentColor }}
                                                className="transition-transform group-hover:rotate-12"
                                            />
                                        </div>
                                        <div className={`text-base font-semibold leading-tight ${textColor === 'white' ? 'text-white' : 'text-slate-900'}`}>
                                            {title}
                                        </div>
                                    </div>
                                    <p
                                        className={`text-sm leading-6 mb-4 ${textColor === 'white' ? 'text-white/80' : 'text-slate-600'}`}
                                    >
                                        {body}
                                    </p>
                                    <div className="mt-auto flex justify-center">
                                        <img
                                            src={imageUrl}
                                            alt={`${title} illustration`}
                                            className={`w-24 h-16 object-contain transition-all duration-300 group-hover:scale-110 ${textColor === 'white' ? 'opacity-80' : 'opacity-70'}`}
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div
                                        className="absolute bottom-0 left-0 h-1 w-full transition-all duration-500 group-hover:h-2"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>}

                <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <div className="flex flex-wrap gap-3">
                        <Link href="/guides" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!activeCategory ? 'bg-[#123524] text-white' : 'border border-slate-300 text-slate-700 hover:bg-white'}`}>
                            All guides
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/guides/category/${category.slug}`}
                                onClick={() =>
                                    trackClickEvent({
                                        path: window.location.pathname,
                                        pageTitle: seo.title,
                                        target: `category:${category.slug}`,
                                        categorySlug: category.slug,
                                    })
                                }
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    activeCategory?.id === category.id ? 'bg-[#123524] text-white' : 'border border-slate-300 text-slate-700 hover:bg-white'
                                }`}
                            >
                                {category.name}
                                {typeof category.published_posts_count === 'number' && <span className="ml-2 text-xs opacity-75">{category.published_posts_count}</span>}
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
                    <div className="rounded-[2rem] bg-linear-to-r from-[#fff4e1] via-white to-[#eef6ec] p-8 shadow-sm">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-semibold tracking-[0.22em] text-[#14573e] uppercase">Browse by topic</p>
                                <h2 className="mt-3 font-serif text-3xl leading-tight text-slate-900 md:text-4xl">Start with the category that matches what you need today.</h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Explore inverter setup guides, troubleshooting help, solar news, rebates and other practical topics for Australian households.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {categories.slice(0, 8).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/guides/category/${category.slug}`}
                                    className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-1 hover:border-[#d9c39b] hover:shadow-md"
                                >
                                    <div className="text-lg font-semibold text-slate-900">{category.name}</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{category.description || 'Browse practical articles, answers and guidance in this topic.'}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {featuredPost && !activeCategory && (
                    <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
                        <article className="grid overflow-hidden rounded-[2rem] bg-white shadow-lg lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="p-8 md:p-10">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="rounded-full bg-[#d9eed0] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#14573e] uppercase">
                                        Featured guide
                                    </span>
                                    {featuredPost.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{featuredPost.category.name}</span>}
                                </div>
                                <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-tight text-slate-900 md:text-5xl">{featuredPost.title}</h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{featuredPost.excerpt}</p>
                                <div className="mt-6 text-sm text-slate-500">
                                    {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString() : ''}
                                    {featuredPost.author?.name ? ` | ${featuredPost.author.name}` : ''}
                                </div>
                                <Link
                                    href={`/guides/${featuredPost.slug}`}
                                    onClick={() =>
                                        trackClickEvent({
                                            path: window.location.pathname,
                                            pageTitle: seo.title,
                                            target: `featured_article:${featuredPost.slug}`,
                                            postSlug: featuredPost.slug,
                                        })
                                    }
                                    className="mt-8 inline-flex rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36]"
                                >
                                    Read guide
                                </Link>
                            </div>
                            <div className="min-h-[320px] bg-slate-200">
                                {featuredPost.featured_image_url && (
                                    <img
                                        src={featuredPost.featured_image_url}
                                        alt={featuredPost.featured_image_alt || featuredPost.title}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                        </article>
                    </section>
                )}

                <section id="articles" className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                    <PublicAdSlot
                        label="Blog content ad"
                        slot={ads.in_article_slot}
                        publisherId={ads.publisher_id}
                        enabled={ads.enabled}
                        displayAds={ads.display_ads}
                        className="mb-6"
                    />
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {posts.data.map((post) => (
                            <article key={post.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="h-56 bg-slate-200">
                                    {post.featured_image_url && (
                                        <img src={post.featured_image_url} alt={post.featured_image_alt || post.title} className="h-full w-full object-cover" />
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {post.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{post.category.name}</span>}
                                        {post.is_featured && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Popular</span>}
                                    </div>
                                    <h3 className="mt-4 line-clamp-2 font-serif text-2xl leading-tight text-slate-900">{post.title}</h3>
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                                    <div className="mt-5 text-xs text-slate-500">
                                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                                        {post.author?.name ? ` | ${post.author.name}` : ''}
                                    </div>
                                    <Link
                                        href={`/guides/${post.slug}`}
                                        onClick={() =>
                                            trackClickEvent({
                                                path: window.location.pathname,
                                                pageTitle: seo.title,
                                                target: `article_card:${post.slug}`,
                                                postSlug: post.slug,
                                                categorySlug: post.category?.slug ?? undefined,
                                            })
                                        }
                                        className="mt-6 inline-flex text-sm font-semibold text-[#14573e]"
                                    >
                                        Read article
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {posts.data.length === 0 && (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
                            No published articles in this section yet.
                        </div>
                    )}

                    {posts.links.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {posts.links.map((link, index) => (
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
                </section>

                <section id="contact" className="mx-auto max-w-7xl px-6 pb-14 pt-2 lg:px-10">
                    <div className="grid overflow-hidden rounded-[2rem] bg-[#123524] text-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="p-8 md:p-10">
                            <p className="text-xs font-semibold tracking-[0.22em] text-[#b8db95] uppercase">Contact Us</p>
                            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">Need help with a solar install, inverter setup or Wi-Fi issue?</h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78">
                                Start with the guide library, then contact the team with the inverter brand, model, monitoring app name and a screenshot of the issue so support starts with context instead of guesswork.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a href="#articles" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                    Browse more guides
                                </a>
                            </div>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                contactForm.post('/contact-enquiry', { preserveScroll: true });
                            }}
                            className="grid gap-4 bg-white/6 p-8 md:grid-cols-2 md:p-10"
                        >
                            <div className="md:col-span-2">
                                {flash?.contact_success && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                                        {flash.contact_success}
                                    </div>
                                )}
                            </div>
                            <InputField inverse label="Full name" value={contactForm.data.name} onChange={(value) => contactForm.setData('name', value)} error={contactForm.errors.name} />
                            <InputField inverse label="Email address" type="email" value={contactForm.data.email} onChange={(value) => contactForm.setData('email', value)} error={contactForm.errors.email} />
                            <InputField inverse label="Phone" value={contactForm.data.phone} onChange={(value) => contactForm.setData('phone', value)} error={contactForm.errors.phone} />
                            <InputField inverse label="Street address" value={contactForm.data.address_line_1} onChange={(value) => contactForm.setData('address_line_1', value)} error={contactForm.errors.address_line_1} />
                            <InputField inverse label="Suburb" value={contactForm.data.suburb} onChange={(value) => contactForm.setData('suburb', value)} error={contactForm.errors.suburb} />
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white">State</label>
                                <select
                                    value={contactForm.data.state}
                                    onChange={(event) => contactForm.setData('state', event.target.value)}
                                    className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f0a23b]"
                                >
                                    {['NSW', 'VIC', 'QLD', 'SA', 'WA', 'ACT', 'TAS', 'NT'].map((state) => (
                                        <option key={state} value={state} className="text-slate-900">{state}</option>
                                    ))}
                                </select>
                                {contactForm.errors.state && <p className="mt-2 text-sm text-red-200">{contactForm.errors.state}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <InputField inverse label="Postcode" value={contactForm.data.postcode} onChange={(value) => contactForm.setData('postcode', value)} error={contactForm.errors.postcode} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-white">How can we help?</label>
                                <textarea
                                    value={contactForm.data.message}
                                    onChange={(event) => contactForm.setData('message', event.target.value)}
                                    rows={5}
                                    className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f0a23b]"
                                    placeholder="Tell us your inverter brand, model, issue, and anything you have already tried."
                                />
                                {contactForm.errors.message && <p className="mt-2 text-sm text-red-200">{contactForm.errors.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={contactForm.processing}
                                    className="rounded-full bg-[#f0a23b] px-6 py-3 text-sm font-semibold text-[#17331f] transition hover:bg-[#f8bb62] disabled:opacity-60"
                                >
                                    {contactForm.processing ? 'Sending...' : 'Send enquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <PublicSiteFooter footer={footer} categories={categories} />
                <LocalLiveChat />
            </div>
        </>
    );
}

function InputField({
    label,
    value,
    onChange,
    error,
    type = 'text',
    step,
    inverse = false,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    step?: string;
    inverse?: boolean;
    required?: boolean;
}) {
    return (
        <div>
            <label className={`mb-2 block text-sm font-semibold ${inverse ? 'text-white' : 'text-slate-800'}`}>{label}</label>
            <input
                type={type}
                step={step}
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    inverse
                        ? 'border border-white/15 bg-black/10 text-white focus:border-[#f0a23b]'
                        : 'border border-slate-300 text-slate-900 focus:border-emerald-500'
                }`}
            />
            {error && <p className={`mt-2 text-sm ${inverse ? 'text-red-200' : 'text-red-600'}`}>{error}</p>}
        </div>
    );
}
