import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, GripVertical, Trash2, Edit2, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'guide' | 'blog';
}

interface MenuItem {
    id: number;
    label: string;
    type: 'page' | 'category' | 'manual';
    url?: string;
    category_id?: number;
    parent_id?: number;
    sort_order: number;
    is_active: boolean;
    children: MenuItem[];
}

export default function AdminMenus({ menus: initialMenus, categories }: { menus: MenuItem[]; categories: Category[] }) {
    const page = usePage();
    const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [parentMenu, setParentMenu] = useState<MenuItem | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
    const [formData, setFormData] = useState({
        label: '',
        type: 'manual' as 'page' | 'category' | 'manual',
        url: '',
        category_id: '',
    });

    const handleOpenDialog = (menu?: MenuItem, parent?: MenuItem) => {
        if (menu) {
            setEditingMenu(menu);
            setFormData({
                label: menu.label,
                type: menu.type,
                url: menu.url || '',
                category_id: menu.category_id?.toString() || '',
            });
        } else {
            setEditingMenu(null);
            setFormData({
                label: '',
                type: 'manual',
                url: '',
                category_id: '',
            });
        }
        setParentMenu(parent || null);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingMenu(null);
        setParentMenu(null);
    };

    const handleSubmit = () => {
        const data: any = {
            label: formData.label,
            type: formData.type,
            url: formData.type === 'manual' ? formData.url : undefined,
            category_id: formData.type === 'category' ? formData.category_id : undefined,
        };

        if (parentMenu) {
            data.parent_id = parentMenu.id;
        }

        if (editingMenu) {
            router.put(route('admin.menus.update', editingMenu.id), data, {
                onSuccess: handleCloseDialog,
            });
        } else {
            router.post(route('admin.menus.store'), data, {
                onSuccess: handleCloseDialog,
            });
        }
    };

    const handleDelete = (menuId: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(route('admin.menus.destroy', menuId));
        }
    };

    const toggleExpanded = (menuId: number) => {
        const newExpanded = new Set(expandedMenus);
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId);
        } else {
            newExpanded.add(menuId);
        }
        setExpandedMenus(newExpanded);
    };

    const renderMenuItems = (items: MenuItem[], level = 0) => {
        return (
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" style={{ marginLeft: `${level * 20}px` }}>
                        <div className="flex items-center gap-3">
                            <GripVertical className="h-5 w-5 flex-shrink-0 cursor-grab text-slate-400 active:cursor-grabbing" />
                            {item.children && item.children.length > 0 && (
                                <button
                                    onClick={() => toggleExpanded(item.id)}
                                    className="text-slate-600 hover:text-slate-900"
                                >
                                    <ChevronDown
                                        className="h-4 w-4 transition-transform"
                                        style={{ transform: expandedMenus.has(item.id) ? 'rotate(0)' : 'rotate(-90deg)' }}
                                    />
                                </button>
                            )}
                            <div className="flex-1">
                                <div className="font-medium text-slate-900">{item.label}</div>
                                <div className="text-xs text-slate-500">
                                    Type: {item.type}
                                    {item.type === 'manual' && item.url && ` • ${item.url}`}
                                    {item.type === 'category' && ` • Category`}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {item.type !== 'category' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(undefined, item)} className="h-8 px-2 text-xs">
                                        + Submenu
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenDialog(item)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {item.children && item.children.length > 0 && expandedMenus.has(item.id) && (
                            <div className="mt-3 space-y-2">
                                {renderMenuItems(item.children, level + 1)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Menu Management" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Menu Management</h1>
                        <p className="mt-2 text-sm text-slate-600">Create and organize your navigation menu items</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Menu Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
                                    {parentMenu && <span className="text-sm font-normal text-slate-600"> (Under: {parentMenu.label})</span>}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="label">Label</Label>
                                    <Input
                                        id="label"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        placeholder="e.g., Installation Guides"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual Link</SelectItem>
                                            <SelectItem value="category">Category</SelectItem>
                                            <SelectItem value="page">Page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.type === 'manual' && (
                                    <div>
                                        <Label htmlFor="url">URL</Label>
                                        <Input
                                            id="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            placeholder="e.g., https://example.com"
                                        />
                                    </div>
                                )}

                                {formData.type === 'category' && (
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit}>
                                        {editingMenu ? 'Update' : 'Add'} Menu Item
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    {menus.length > 0 ? (
                        renderMenuItems(menus)
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-slate-500">No menu items yet. Create your first menu item to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
