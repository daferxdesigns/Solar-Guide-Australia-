import AdminSettingsLayout from '@/components/admin-settings-layout';
import { router } from '@inertiajs/react';
import { BrainCircuit, CheckCircle2, KeyRound, PlayCircle, Save, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

type AiWriterAccount = {
    id: number;
    name: string;
    provider: string;
    model: string;
    masked_api_key: string;
    default_instructions: string;
    is_active: boolean;
    sort_order: number;
    last_used_at?: string | null;
    created_at?: string | null;
};

type AccountForm = {
    name: string;
    model: string;
    api_key: string;
    default_instructions: string;
    is_active: boolean;
    sort_order: number;
};

const emptyForm: AccountForm = {
    name: '',
    model: 'gpt-5.2',
    api_key: '',
    default_instructions: '',
    is_active: true,
    sort_order: 0,
};

export default function AiWriter({ accounts, modelSuggestions }: { accounts: AiWriterAccount[]; modelSuggestions: string[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<AccountForm>(emptyForm);

    const activeAccounts = accounts.filter((account) => account.is_active).length;

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setForm((current) => ({ ...current, [target.name]: target.checked }));
            return;
        }

        if (target instanceof HTMLInputElement && target.type === 'number') {
            setForm((current) => ({
                ...current,
                [target.name]: target.value === '' ? 0 : Number(target.value),
            }));
            return;
        }

        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editingId) {
            router.post(`/admin/settings/ai-writer/accounts/${editingId}`, {
                ...form,
                _method: 'put',
            });
            return;
        }

        router.post('/admin/settings/ai-writer/accounts', form, {
            onSuccess: () => {
                setForm(emptyForm);
                setEditingId(null);
            },
        });
    };

    const editAccount = (account: AiWriterAccount) => {
        setEditingId(account.id);
        setForm({
            name: account.name,
            model: account.model,
            api_key: '',
            default_instructions: account.default_instructions ?? '',
            is_active: account.is_active,
            sort_order: account.sort_order,
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    return (
        <AdminSettingsLayout
            title="AI Writer"
            description="Save multiple OpenAI API accounts, then pick one inside the post editor to draft solar guides, SEO fields, and excerpts."
            activeHref="/admin/settings/ai-writer"
        >
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-3xl font-semibold text-slate-950">{accounts.length}</div>
                    <div className="mt-1 text-sm text-slate-500">Saved AI accounts</div>
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-3xl font-semibold text-slate-950">{activeAccounts}</div>
                    <div className="mt-1 text-sm text-slate-500">Available in Add Post</div>
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-3xl font-semibold text-slate-950">{modelSuggestions[0] ?? 'gpt-5.2'}</div>
                    <div className="mt-1 text-sm text-slate-500">Default model</div>
                </div>
            </section>

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit AI account' : 'Add AI account'}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Use an OpenAI API key from each account or project you want to write from. Keys are encrypted before storage.
                            </p>
                        </div>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                New account
                            </button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Account name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                placeholder="Daryl OpenAI account"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Model</label>
                            <input
                                name="model"
                                value={form.model}
                                onChange={handleChange}
                                list="ai-model-suggestions"
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                placeholder="gpt-5.2"
                                required
                            />
                            <datalist id="ai-model-suggestions">
                                {modelSuggestions.map((model) => (
                                    <option key={model} value={model} />
                                ))}
                            </datalist>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-800">OpenAI API key</label>
                            <input
                                name="api_key"
                                type="password"
                                value={form.api_key}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                placeholder={editingId ? 'Leave blank to keep the saved key' : 'sk-...'}
                                required={!editingId}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Sort order</label>
                            <input
                                name="sort_order"
                                type="number"
                                min="0"
                                value={form.sort_order}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                            />
                        </div>
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                            <input
                                name="is_active"
                                type="checkbox"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                            />
                            Available in post editor
                        </label>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-800">Default instructions</label>
                            <textarea
                                name="default_instructions"
                                value={form.default_instructions}
                                onChange={handleChange}
                                rows={5}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm transition outline-none focus:border-emerald-500"
                                placeholder="Example: Always mention Solar Support Australia as a helpful guide library, avoid sales claims, and write for Australian homeowners."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <Save className="h-4 w-4" />
                        {editingId ? 'Update AI account' : 'Save AI account'}
                    </button>
                </section>

                <section className="space-y-4">
                    {accounts.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                            Add your first OpenAI API key here. After it is active, the post editor will show the AI drafting panel.
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <article key={account.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-950">{account.name}</h3>
                                        <div className="mt-1 text-sm text-slate-500">{account.model}</div>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${account.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {account.is_active ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                                <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                                    {account.masked_api_key}
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                    {account.last_used_at ? `Last used ${new Date(account.last_used_at).toLocaleString()}` : 'Not used yet'}
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    <button
                                        type="button"
                                        onClick={() => editAccount(account)}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/admin/settings/ai-writer/accounts/${account.id}/test`)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        <PlayCircle className="h-4 w-4" />
                                        Test
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm(`Delete ${account.name}?`)) {
                                                router.delete(`/admin/settings/ai-writer/accounts/${account.id}`);
                                            }
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
