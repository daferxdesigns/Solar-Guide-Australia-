import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
    posts_count: number;
    parent?: {
        id: number;
        name: string;
    } | null;
    children?: Category[];
}

interface ParentOption {
    id: number;
    name: string;
    slug: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
];

export default function Index({ categories, parentOptions }: { categories: Category[]; parentOptions: ParentOption[] }) {
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        sort_order: '0',
        parent_id: '',
    });

    const handleCreate = (event: FormEvent) => {
        event.preventDefault();

        router.post('/admin/categories', {
            ...newCategory,
            sort_order: Number(newCategory.sort_order || 0),
            parent_id: newCategory.parent_id !== '' ? Number(newCategory.parent_id) : null,
        });
    };

    const rootCategories = categories.filter((category) => !category.parent);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guide Categories" />

            <div className="space-y-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-3xl font-semibold text-slate-900">Guide categories</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600">Group your solar installation and troubleshooting content into clear sections.</p>
                </section>

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">Add category</h2>
                        <form onSubmit={handleCreate} className="mt-4 space-y-4">
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="Category name"
                                required
                            />
                            <textarea
                                value={newCategory.description}
                                onChange={(event) => setNewCategory((current) => ({ ...current, description: event.target.value }))}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="Short category description"
                            />
                            <input
                                type="number"
                                min="0"
                                value={newCategory.sort_order}
                                onChange={(event) => setNewCategory((current) => ({ ...current, sort_order: event.target.value }))}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                placeholder="Sort order"
                            />
                            <select
                                value={newCategory.parent_id}
                                onChange={(event) => setNewCategory((current) => ({ ...current, parent_id: event.target.value }))}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                            >
                                <option value="">Top-level category</option>
                                {parentOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Create category
                            </button>
                        </form>
                    </section>

                    <section className="space-y-4">
                        {rootCategories.map((category) => (
                            <CategoryCard key={category.id} category={category} parentOptions={parentOptions} />
                        ))}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function CategoryCard({ category, parentOptions }: { category: Category; parentOptions: ParentOption[] }) {
    const [form, setForm] = useState({
        name: category.name,
        description: category.description ?? '',
        sort_order: String(category.sort_order ?? 0),
        parent_id: category.parent?.id ? String(category.parent.id) : '',
    });

    const availableParentOptions = parentOptions.filter((option) => option.id !== category.id);

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <form
                onSubmit={(event) => {
                    event.preventDefault();

                    router.post(`/admin/categories/${category.id}`, {
                        ...form,
                        sort_order: Number(form.sort_order || 0),
                        parent_id: form.parent_id !== '' ? Number(form.parent_id) : null,
                        _method: 'put',
                    });
                }}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Category name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                required
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">Parent category</label>
                                <select
                                    value={form.parent_id}
                                    onChange={(event) => setForm((current) => ({ ...current, parent_id: event.target.value }))}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                >
                                    <option value="">Top-level category</option>
                                    {availableParentOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    rows={3}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-64">
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">Slug</div>
                                <div className="mt-1 font-medium text-slate-800">{category.slug}</div>
                            </div>
                            <div>
                                <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">Articles</div>
                                <div className="mt-1 font-medium text-slate-800">{category.posts_count}</div>
                            </div>
                            <div>
                                <div className="text-xs tracking-[0.16em] text-slate-500 uppercase">Subcategories</div>
                                <div className="mt-1 font-medium text-slate-800">{category.children?.length ?? 0}</div>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs tracking-[0.16em] text-slate-500 uppercase">Sort order</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.sort_order}
                                    onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                    Save category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm(`Delete "${category.name}"? Existing posts will become uncategorized.`)) {
                                            router.delete(`/admin/categories/${category.id}`);
                                        }
                                    }}
                                    className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {category.children && category.children.length > 0 && (
                <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Subcategories</div>
                    {category.children.map((child) => (
                        <div key={child.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="font-semibold text-slate-900">{child.name}</div>
                                    <div className="mt-1 text-sm text-slate-500">{child.slug}</div>
                                </div>
                                <div className="text-sm text-slate-600">{child.posts_count} articles</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
