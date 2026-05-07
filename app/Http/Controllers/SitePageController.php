<?php

namespace App\Http\Controllers;

use App\Models\GuideCategory;
use App\Models\Menu;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Services\SeoMetaBuilder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    public function home(Request $request): Response
    {
        $settings = SiteSetting::current()->load('homepagePage');
        $page = $settings->homepagePage;

        if ($page && $page->status === 'published' && ($page->published_at === null || $page->published_at->lte(now()))) {
            return $this->renderPage($page, true);
        }

        return app(GuideController::class)->index($request);
    }

    public function show(SitePage $page): Response
    {
        abort_unless(
            $page->status === 'published'
                && ($page->published_at === null || $page->published_at->lte(now())),
            404,
        );

        return $this->renderPage($page);
    }

    private function renderPage(SitePage $page, bool $isHomepage = false): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Public/Page', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'featured_image_url' => $page->featured_image_url,
                'featured_image_alt' => $page->featured_image_alt,
                'public_url' => $page->public_url,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
            'seo' => app(SeoMetaBuilder::class)->page($page, $settings, $isHomepage),
            'isHomepage' => $isHomepage,
            'categories' => GuideCategory::query()
                ->withCount([
                    'posts as published_posts_count' => fn ($query) => $query->published(),
                ])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description', 'sort_order', 'type']),
            'menus' => $this->menus($settings),
            'footer' => [
                'layout' => $settings->footer_layout ?: SiteSetting::defaultFooterLayout(),
                'background_mode' => $settings->footer_background_mode ?? 'color',
                'background_color' => $settings->footer_background_color ?? '#ffffff',
                'background_image_url' => $settings->footer_background_image_url,
                'background_image_position' => $settings->footer_background_image_position ?? 'center center',
                'background_image_size' => $settings->footer_background_image_size ?? 'cover',
                'background_image_repeat' => $settings->footer_background_image_repeat ?? 'no-repeat',
            ],
        ]);
    }

    private function menus(SiteSetting $settings)
    {
        if (!$settings->dynamic_menus_enabled) {
            $guideCategories = GuideCategory::query()
                ->where('type', 'guide')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);

            $blogCategories = GuideCategory::query()
                ->where('type', 'blog')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);

            return [
                [
                    'id' => 1,
                    'label' => 'Home',
                    'type' => 'manual',
                    'url' => '/',
                    'children' => [],
                    'category' => null,
                ],
                [
                    'id' => 2,
                    'label' => 'Guides',
                    'type' => 'page',
                    'url' => '/guides',
                    'children' => $guideCategories->map(fn ($category) => [
                        'id' => $category->id,
                        'label' => $category->name,
                        'type' => 'category',
                        'url' => "/guides/category/{$category->slug}",
                        'category' => [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                        ],
                    ])->values()->all(),
                    'category' => null,
                ],
                [
                    'id' => 3,
                    'label' => 'Blog',
                    'type' => 'page',
                    'url' => '/guides',
                    'children' => $blogCategories->map(fn ($category) => [
                        'id' => $category->id,
                        'label' => $category->name,
                        'type' => 'category',
                        'url' => "/guides/category/{$category->slug}",
                        'category' => [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                        ],
                    ])->values()->all(),
                    'category' => null,
                ],
                [
                    'id' => 4,
                    'label' => 'Contact us',
                    'type' => 'manual',
                    'url' => '/guides#contact',
                    'children' => [],
                    'category' => null,
                ],
            ];
        }

        return Menu::with('children', 'category')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (Menu $menu) {
                return [
                    'id' => $menu->id,
                    'label' => $menu->label,
                    'type' => $menu->type,
                    'url' => $menu->url,
                    'children' => $menu->children->where('is_active', true)->map(function (Menu $child) {
                        return [
                            'id' => $child->id,
                            'label' => $child->label,
                            'type' => $child->type,
                            'url' => $child->url,
                            'category' => $child->category ? [
                                'id' => $child->category->id,
                                'name' => $child->category->name,
                                'slug' => $child->category->slug,
                            ] : null,
                        ];
                    })->sortBy('sort_order')->values(),
                    'category' => $menu->category ? [
                        'id' => $menu->category->id,
                        'name' => $menu->category->name,
                        'slug' => $menu->category->slug,
                    ] : null,
                ];
            });
    }
}
