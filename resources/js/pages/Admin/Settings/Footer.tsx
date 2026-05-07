import AdminSettingsLayout from '@/components/admin-settings-layout';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

type FooterBlock = {
    id: string;
    type: 'brand' | 'links' | 'categories' | 'subscribe' | 'text';
    title?: string;
    body?: string;
    enabled?: boolean;
    button_label?: string;
    limit?: number;
    items?: Array<{ label: string; url: string }>;
};

export default function Footer({
    settings,
}: {
    settings: {
        footer_layout: FooterBlock[];
        footer_background_mode?: 'color' | 'image';
        footer_background_color?: string | null;
        footer_background_image_url?: string | null;
        footer_background_image_position?: string | null;
        footer_background_image_size?: string | null;
        footer_background_image_repeat?: string | null;
    };
}) {
    const [blocks, setBlocks] = useState<FooterBlock[]>(settings.footer_layout ?? []);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [backgroundMode, setBackgroundMode] = useState(settings.footer_background_mode ?? 'color');
    const [backgroundColor, setBackgroundColor] = useState(settings.footer_background_color ?? '#ffffff');
    const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(settings.footer_background_image_url ?? null);
    const [backgroundPosition, setBackgroundPosition] = useState(settings.footer_background_image_position ?? 'center center');
    const [backgroundSize, setBackgroundSize] = useState(settings.footer_background_image_size ?? 'cover');
    const [backgroundRepeat, setBackgroundRepeat] = useState(settings.footer_background_image_repeat ?? 'no-repeat');
    const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);

    const previewStyle = useMemo(
        () =>
            backgroundMode === 'image' && backgroundImagePreview
                ? {
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${backgroundImagePreview})`,
                      backgroundPosition: backgroundPosition,
                      backgroundSize: backgroundSize,
                      backgroundRepeat: backgroundRepeat,
                  }
                : {
                      backgroundColor,
                  },
        [backgroundColor, backgroundImagePreview, backgroundMode, backgroundPosition, backgroundRepeat, backgroundSize],
    );

    const updateBlock = (id: string, patch: Partial<FooterBlock>) => {
        setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
    };

    const reorder = (targetId: string) => {
        if (!draggingId || draggingId === targetId) {
            return;
        }

        setBlocks((current) => {
            const next = [...current];
            const fromIndex = next.findIndex((block) => block.id === draggingId);
            const toIndex = next.findIndex((block) => block.id === targetId);

            if (fromIndex === -1 || toIndex === -1) {
                return current;
            }

            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            '/admin/settings/footer',
            {
                footer_layout: blocks,
                footer_background_mode: backgroundMode,
                footer_background_color: backgroundColor,
                footer_background_image_position: backgroundPosition,
                footer_background_image_size: backgroundSize,
                footer_background_image_repeat: backgroundRepeat,
                remove_footer_background_image: removeBackgroundImage ? 1 : 0,
                footer_background_image: backgroundImage,
            },
            { forceFormData: true },
        );
    };

    return (
        <AdminSettingsLayout
            title="Footer Builder"
            description="Arrange your footer blocks with drag and drop, update copy in place, and control the background styling without touching code."
            activeHref="/admin/settings/footer"
        >
            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">Footer blocks</h2>
                        <button
                            type="button"
                            onClick={() =>
                                setBlocks((current) => [
                                    ...current,
                                    {
                                        id: `text-${Date.now()}`,
                                        type: 'text',
                                        title: 'New block',
                                        body: 'Add your custom footer content here.',
                                        enabled: true,
                                    },
                                ])
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <Plus className="h-4 w-4" />
                            Add block
                        </button>
                    </div>

                    {blocks.map((block) => (
                        <div
                            key={block.id}
                            draggable
                            onDragStart={() => setDraggingId(block.id)}
                            onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                            onDrop={() => reorder(block.id)}
                            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    <GripVertical className="h-4 w-4" />
                                    {block.type}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))}
                                    className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-4 grid gap-4">
                                <input
                                    value={block.title ?? ''}
                                    onChange={(event) => updateBlock(block.id, { title: event.target.value })}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    placeholder="Block title"
                                />
                                <textarea
                                    value={block.body ?? ''}
                                    onChange={(event) => updateBlock(block.id, { body: event.target.value })}
                                    rows={block.type === 'subscribe' ? 4 : 3}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                    placeholder="Block content"
                                />
                                {block.type === 'links' && (
                                    <textarea
                                        value={(block.items ?? []).map((item) => `${item.label}|${item.url}`).join('\n')}
                                        onChange={(event) =>
                                            updateBlock(block.id, {
                                                items: event.target.value
                                                    .split('\n')
                                                    .map((line) => line.trim())
                                                    .filter(Boolean)
                                                    .map((line) => {
                                                        const [label, url] = line.split('|');
                                                        return {
                                                            label: (label ?? '').trim(),
                                                            url: (url ?? '').trim(),
                                                        };
                                                    }),
                                            })
                                        }
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Label|/guides"
                                    />
                                )}
                                {block.type === 'categories' && (
                                    <input
                                        type="number"
                                        value={block.limit ?? 4}
                                        onChange={(event) => updateBlock(block.id, { limit: Number(event.target.value) })}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="How many categories to show"
                                    />
                                )}
                                {block.type === 'subscribe' && (
                                    <input
                                        value={block.button_label ?? ''}
                                        onChange={(event) => updateBlock(block.id, { button_label: event.target.value })}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                        placeholder="Button label"
                                    />
                                )}
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={block.enabled !== false}
                                        onChange={(event) => updateBlock(block.id, { enabled: event.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                    />
                                    Show this block
                                </label>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">Background styling</h2>
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <select
                                    value={backgroundMode}
                                    onChange={(event) => setBackgroundMode(event.target.value as 'color' | 'image')}
                                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                >
                                    <option value="color">Color</option>
                                    <option value="image">Image</option>
                                </select>
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(event) => setBackgroundColor(event.target.value)}
                                    className="h-12 rounded-2xl border border-slate-300 px-2 py-2"
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setBackgroundImage(file);
                                    setRemoveBackgroundImage(false);
                                    setBackgroundImagePreview(file ? URL.createObjectURL(file) : settings.footer_background_image_url ?? null);
                                }}
                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                            />
                            <div className="grid gap-4">
                                <select value={backgroundPosition} onChange={(event) => setBackgroundPosition(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500">
                                    {['left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom'].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <select value={backgroundSize} onChange={(event) => setBackgroundSize(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500">
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="100% 100%">Fill</option>
                                    <option value="auto">Auto</option>
                                </select>
                                <select value={backgroundRepeat} onChange={(event) => setBackgroundRepeat(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500">
                                    <option value="no-repeat">No repeat</option>
                                    <option value="repeat">Repeat</option>
                                    <option value="repeat-x">Repeat X</option>
                                    <option value="repeat-y">Repeat Y</option>
                                </select>
                            </div>
                            {backgroundImagePreview && (
                                <label className="flex items-center gap-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={removeBackgroundImage}
                                        onChange={(event) => setRemoveBackgroundImage(event.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-red-600"
                                    />
                                    Remove current background image
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">Live preview</div>
                        <div style={previewStyle} className="p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {blocks.filter((block) => block.enabled !== false).map((block) => (
                                    <div key={`preview-${block.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
                                        <div className="text-sm font-semibold text-slate-900">{block.title || 'Untitled block'}</div>
                                        <div className="mt-2 text-sm leading-6 text-slate-600">{block.body || 'Block preview content.'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                            Save footer builder
                        </button>
                    </div>
                </section>
            </form>
        </AdminSettingsLayout>
    );
}
