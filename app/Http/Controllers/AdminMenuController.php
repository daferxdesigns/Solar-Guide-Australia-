<?php

namespace App\Http\Controllers;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminMenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::with('category')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get()
            ->map(fn(Menu $menu) => $this->formatMenu($menu));

        return Inertia::render('Admin/Menus/Index', [
            'menus' => $menus,
            'categories' => GuideCategory::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:page,category,manual',
            'url' => 'nullable|string|max:2000|required_if:type,manual',
            'category_id' => 'nullable|exists:guide_categories,id|required_if:type,category',
            'parent_id' => 'nullable|exists:menus,id',
        ]);

        Menu::create(array_merge($validated, [
            'sort_order' => Menu::max('sort_order') + 1,
        ]));

        return redirect()->route('admin.menus.index')->with('success', 'Menu created successfully');
    }

    public function update(Menu $menu, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:page,category,manual',
            'url' => 'nullable|string|max:2000|required_if:type,manual',
            'category_id' => 'nullable|exists:guide_categories,id|required_if:type,category',
            'parent_id' => 'nullable|exists:menus,id',
            'is_active' => 'nullable|boolean',
        ]);

        $menu->update($validated);

        return redirect()->route('admin.menus.index')->with('success', 'Menu updated successfully');
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();

        return redirect()->route('admin.menus.index')->with('success', 'Menu deleted successfully');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menus,id',
            'items.*.parent_id' => 'nullable|exists:menus,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            Menu::where('id', $item['id'])->update([
                'parent_id' => $item['parent_id'],
                'sort_order' => $item['sort_order'],
            ]);
        }

        return redirect()->route('admin.menus.index')->with('success', 'Menu reordered successfully');
    }

    public function getOptions(): JsonResponse
    {
        $categories = GuideCategory::select('id', 'name', 'slug', 'type')->orderBy('type')->orderBy('name')->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    private function formatMenu(Menu $menu): array
    {
        return [
            'id' => $menu->id,
            'label' => $menu->label,
            'type' => $menu->type,
            'url' => $menu->url,
            'category_id' => $menu->category_id,
            'parent_id' => $menu->parent_id,
            'sort_order' => $menu->sort_order,
            'is_active' => $menu->is_active,
            'children' => $menu->children->map(fn(Menu $child) => $this->formatMenu($child))->toArray(),
        ];
    }
}
