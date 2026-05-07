import { trackClickEvent } from '@/lib/analytics';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, ChevronDown, Edit, LogOut, Menu, Plus, Settings, User } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'guide' | 'blog';
    published_posts_count?: number;
}

interface MenuItem {
    id: number;
    label: string;
    type: 'page' | 'category' | 'manual';
    url: string;
    children: MenuItem[];
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

export function PublicSiteHeader(props: any) {
    const { categories, menus, pageTitle, activeCategorySlug, className = '', postId } = props;
    const { auth } = usePage().props as any;

    const guideCategories = categories.filter((cat: any) => cat.type === 'guide');
    const blogCategories = categories.filter((cat: any) => cat.type === 'blog');

    return (
        <>
            {auth?.user && <AdminBar user={auth.user} pageTitle={pageTitle} postId={postId} />}
            <div className="relative z-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <div className="flex items-center justify-between gap-4 py-2">
                        <a href="/" className="min-w-0 cursor-pointer">
                            <div className="text-[11px] font-semibold tracking-[0.28em] text-[#b8db95] uppercase">Solar Support Australia</div>
                        </a>

                        <div className="hidden items-center gap-2 lg:flex">
                            {menus && menus.length > 0 ? (
                                menus.map((menu: any) => {
                                    if (menu.children.length > 0) {
                                        return <MenuDropdown key={menu.id} menu={menu} activeCategorySlug={activeCategorySlug} />;
                                    } else {
                                        return <NavLink key={menu.id} href={menu.url} label={menu.label} />;
                                    }
                                })
                            ) : (
                                <>
                                    <NavLink href="/guides" label="Home" />
                                    <CategoryMenu title="Guides" categories={guideCategories} activeCategorySlug={activeCategorySlug} />
                                    <CategoryMenu title="Blog" categories={blogCategories} activeCategorySlug={activeCategorySlug} />
                                    <NavLink href="/guides#contact" label="Contact us" />
                                </>
                            )}
                        </div>

                        <details className="group relative lg:hidden">
                            <summary className="flex list-none items-center justify-center rounded-full border border-white/15 p-3 text-white transition hover:bg-white/10">
                                <Menu className="h-5 w-5" />
                            </summary>
                            <div className="absolute right-0 z-[80] mt-3 w-[min(20rem,calc(100vw-3rem))] rounded-[1.5rem] border border-white/10 bg-[#103426]/98 p-4 text-white shadow-2xl backdrop-blur-xl">
                                {menus && menus.length > 0 ? (
                                    <div className="space-y-2">
                                        {menus.map((menu: any) => (
                                            <div key={menu.id}>
                                                <MobileNavLink href={menu.url} label={menu.label} />
                                                {menu.children.length > 0 && (
                                                    <div className="mt-2 space-y-2 pl-4">
                                                        {menu.children.map((child: any) => (
                                                            <MobileNavLink key={child.id} href={child.url} label={child.label} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <MobileNavLink href="/guides" label="Home" />
                                            <MobileNavLink href="/guides#contact" label="Contact us" />
                                        </div>
                                        <div className="mt-4 border-t border-white/10 pt-4">
                                            <div className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-[#b8db95] uppercase">Guides</div>
                                            <div className="space-y-2">
                                                {guideCategories.map((category: any) => (
                                                    <MobileNavLink
                                                        key={category.id}
                                                        href={`/guides/category/${category.slug}`}
                                                        label={category.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-4 border-t border-white/10 pt-4">
                                            <div className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-[#b8db95] uppercase">
                                                Blog Categories
                                            </div>
                                            <div className="space-y-2">
                                                {blogCategories.map((category: any) => (
                                                    <MobileNavLink
                                                        key={category.id}
                                                        href={`/guides/category/${category.slug}`}
                                                        label={category.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </>
    );
}

function AdminBar({ user, pageTitle, postId }: { user: any; pageTitle: string; postId?: number }) {
    return (
        <div className="bg-[#123524] text-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-4">
                        {postId && (
                            <Link
                                href={`/admin/posts/${postId}/edit`}
                                className="flex items-center gap-2 rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                    trackClickEvent({
                                        path: window.location.pathname,
                                        pageTitle,
                                        target: 'admin_bar_edit_post',
                                    })
                                }
                            >
                                <Edit className="h-4 w-4" />
                                Edit Post
                            </Link>
                        )}
                        <Link
                            href="/admin/posts/create"
                            className="flex items-center gap-2 rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <Plus className="h-4 w-4" />
                            New Post
                        </Link>
                        <Link
                            href="/admin/analytics"
                            className="flex items-center gap-2 rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </Link>
                    </div>
                    <UserMenu user={user} pageTitle={pageTitle} />
                </div>
            </div>
        </div>
    );
}

function UserMenu({ user, pageTitle }: { user: any; pageTitle: string }) {
    return (
        <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.name}</span>
                <ChevronDown className="h-3 w-3 transition group-open:rotate-180" />
            </summary>
            <div className="absolute top-full right-0 z-[100] mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                <Link
                    href="/settings/profile"
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                    <User className="h-4 w-4" />
                    Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2 rounded px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                <hr className="my-1 border-slate-200" />
                <button
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </details>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-white/88 transition hover:bg-white/10 hover:text-white"
        >
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="block cursor-pointer rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
            {label}
        </Link>
    );
}

function CategoryMenu({ title, categories, activeCategorySlug }: { title: string; categories: Category[]; activeCategorySlug?: string | null }) {
    return (
        <details className="group relative z-[70]">
            <summary className="flex list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/88 transition hover:bg-white/10 hover:text-white">
                <span>{title}</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute top-full left-0 z-[90] mt-3 w-72 rounded-[1.25rem] border border-white/10 bg-[#103426]/98 p-2 shadow-2xl backdrop-blur-xl">
                <div className="space-y-1">
                    {categories.map((category: any) => (
                        <Link
                            key={category.id}
                            href={`/guides/category/${category.slug}`}
                            className={`flex cursor-pointer items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm transition ${
                                activeCategorySlug === category.slug
                                    ? 'bg-[#f0a23b] text-[#17331f]'
                                    : 'text-white/88 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className="font-semibold">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </details>
    );
}

function MenuDropdown({ menu, activeCategorySlug }: { menu: MenuItem; activeCategorySlug?: string | null }) {
    return (
        <details className="group relative z-[70]">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/88 transition hover:bg-white/10 hover:text-white">
                <span>{menu.label}</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute top-full left-0 z-[90] mt-3 w-72 rounded-[1.25rem] border border-white/10 bg-[#103426]/98 p-2 shadow-2xl backdrop-blur-xl">
                <div className="space-y-1">
                    {menu.children.map((child: any) => (
                        <Link
                            key={child.id}
                            href={child.url}
                            className={`flex cursor-pointer items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm transition ${
                                child.category && activeCategorySlug === child.category.slug
                                    ? 'bg-[#f0a23b] text-[#17331f]'
                                    : 'text-white/88 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className="font-semibold">{child.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </details>
    );
}
