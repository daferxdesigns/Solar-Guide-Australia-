<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Models\GuidePostVisit;
use App\Models\Menu;
use App\Models\SiteSetting;
use App\Services\SeoMetaBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    public function home(Request $request): Response
    {
        $settings = SiteSetting::current()->load('homepagePage');
        $page = $settings->homepagePage;

        if ($page && $page->status === 'published' && ($page->published_at === null || $page->published_at->lte(now()))) {
            return app(SitePageController::class)->show($page);
        }

        return $this->index($request);
    }

    public function index(Request $request): Response
    {
        $settings = SiteSetting::current();
        $isHomepage = $request->routeIs('home');
        $landingPath = $isHomepage ? route('home', absolute: false) : route('guides.index', absolute: false);
        $landingCanonical = $isHomepage ? route('home') : route('guides.index');

        $this->recordAnalyticsEvent($request, 'page_view', [
            'path' => $landingPath,
            'page_title' => $settings->site_title ?: 'Solar Support Australia',
        ]);

        $posts = GuidePost::query()
            ->with(['category:id,name,slug', 'user:id,name'])
            ->published()
            ->latest('published_at')
            ->paginate(9)
            ->through(fn(GuidePost $post) => $this->postCard($post))
            ->withQueryString();

        $featuredPost = GuidePost::query()
            ->with(['category:id,name,slug', 'user:id,name'])
            ->published()
            ->where('is_featured', true)
            ->latest('published_at')
            ->first();

        return Inertia::render('Guides/Index', [
            'hero' => [
                'title' => $settings->hero_title ?: 'Solar installation guides and troubleshooting articles',
                'subtitle' => $settings->hero_subtitle ?: 'Australia-focused solar guides for installers, admin teams, and solar system owners.',
                'background_image_url' => $settings->homepage_background_image_url,
            ],
            'seo' => app(SeoMetaBuilder::class)->listing($settings, $landingCanonical),
            'featuredPost' => $featuredPost ? $this->postCard($featuredPost) : null,
            'posts' => $posts,
            'categories' => $this->categories(),
            'menus' => $this->menus(),
            'activeCategory' => null,
            'ads' => $this->adsConfig($settings),
            'footer' => $this->footerConfig($settings),
        ]);
    }

    public function category(GuideCategory $category): Response
    {
        $settings = SiteSetting::current();

        $this->recordAnalyticsEvent(request(), 'category_view', [
            'path' => route('guides.category', $category, absolute: false),
            'page_title' => $category->name,
            'guide_category_id' => $category->id,
        ]);

        $posts = GuidePost::query()
            ->with(['category:id,name,slug', 'user:id,name'])
            ->published()
            ->where('guide_category_id', $category->id)
            ->latest('published_at')
            ->paginate(9)
            ->through(fn(GuidePost $post) => $this->postCard($post))
            ->withQueryString();

        return Inertia::render('Guides/Index', [
            'hero' => [
                'title' => $category->name,
                'subtitle' => $category->description ?: 'Published guides in this category.',
            ],
            'seo' => app(SeoMetaBuilder::class)->category($category, $settings),
            'featuredPost' => null,
            'posts' => $posts,
            'categories' => $this->categories(),
            'menus' => $this->menus(),
            'activeCategory' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'ads' => $this->adsConfig($settings),
            'footer' => $this->footerConfig($settings),
        ]);
    }

    public function show(Request $request, GuidePost $post): Response
    {
        abort_unless(
            $post->status === 'published'
                && $post->published_at !== null
                && $post->published_at->lte(now()),
            404,
        );

        $this->recordVisit($request, $post);
        $this->recordAnalyticsEvent($request, 'article_view', [
            'path' => route('guides.show', $post, absolute: false),
            'page_title' => $post->title,
            'guide_post_id' => $post->id,
            'guide_category_id' => $post->guide_category_id,
        ]);
        $post->load([
            'category:id,name,slug',
            'user:id,name',
            'comments' => fn($query) => $query->where('status', 'approved')->latest(),
        ]);
        $settings = SiteSetting::current();

        $related = GuidePost::query()
            ->with(['category:id,name,slug'])
            ->published()
            ->whereKeyNot($post->id)
            ->when($post->guide_category_id, fn($query) => $query->where('guide_category_id', $post->guide_category_id))
            ->latest('published_at')
            ->limit(3)
            ->get()
            ->map(fn(GuidePost $relatedPost) => $this->postCard($relatedPost));

        return Inertia::render('Guides/Show', [
            'seo' => app(SeoMetaBuilder::class)->post($post, $settings),
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'seo_title' => $post->seo_title,
                'seo_description' => $post->seo_description,
                'seo_keywords' => $post->seo_keywords,
                'canonical_url' => $post->canonical_url,
                'content' => $post->content,
                'featured_image_url' => $post->featured_image_url,
                'featured_image_alt' => $post->featured_image_alt,
                'header_background_mode' => $post->header_background_mode ?? 'color',
                'header_background_color' => $post->header_background_color ?? '#123524',
                'header_background_image_url' => $post->header_background_image_url,
                'header_background_image_position' => $post->header_background_image_position ?? 'center center',
                'header_background_image_size' => $post->header_background_image_size ?? 'cover',
                'header_background_image_repeat' => $post->header_background_image_repeat ?? 'no-repeat',
                'header_overlay_opacity' => (int) ($post->header_overlay_opacity ?? 72),
                'published_at' => $post->published_at?->toIso8601String(),
                'category' => $post->category,
                'author' => $post->user ? ['name' => $post->user->name] : null,
                'analytics' => $this->analytics($post),
                'comments' => $post->comments->map(fn(GuidePostComment $comment) => [
                    'id' => $comment->id,
                    'author_name' => $comment->author_name,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at?->toIso8601String(),
                ])->all(),
                'comments_count' => $post->comments->count(),
            ],
            'categories' => $this->categories(),
            'menus' => $this->menus(),
            'relatedPosts' => $related,
            'ads' => $this->adsConfig($settings),
            'footer' => $this->footerConfig($settings),
        ]);
    }

    private function adsConfig(SiteSetting $settings): array
    {
        return [
            'enabled' => (bool) $settings->adsense_enabled,
            'display_ads' => (bool) $settings->adsense_display_ads,
            'publisher_id' => $settings->adsense_publisher_id,
            'header_slot' => $settings->adsense_header_slot,
            'in_article_slot' => $settings->adsense_in_article_slot,
            'sidebar_slot' => $settings->adsense_sidebar_slot,
        ];
    }

    private function footerConfig(SiteSetting $settings): array
    {
        return [
            'layout' => $settings->footer_layout ?: SiteSetting::defaultFooterLayout(),
            'background_mode' => $settings->footer_background_mode ?? 'color',
            'background_color' => $settings->footer_background_color ?? '#ffffff',
            'background_image_url' => $settings->footer_background_image_url,
            'background_image_position' => $settings->footer_background_image_position ?? 'center center',
            'background_image_size' => $settings->footer_background_image_size ?? 'cover',
            'background_image_repeat' => $settings->footer_background_image_repeat ?? 'no-repeat',
        ];
    }

    private function categories()
    {
        return GuideCategory::query()
            ->withCount([
                'posts as published_posts_count' => fn($query) => $query->published(),
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'sort_order', 'type']);
    }

    private function menus()
    {
        $settings = SiteSetting::current();

        if (!$settings->dynamic_menus_enabled) {
            return $this->defaultMenus();
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

    private function defaultMenus(): array
    {
        $guideCategories = $this->categories()->filter(fn($cat) => $cat['type'] === 'guide');
        $blogCategories = $this->categories()->filter(fn($cat) => $cat['type'] === 'blog');

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
                'children' => $guideCategories->map(function ($cat) {
                    return [
                        'id' => $cat['id'],
                        'label' => $cat['name'],
                        'type' => 'category',
                        'url' => "/guides/category/{$cat['slug']}",
                        'category' => $cat,
                    ];
                })->values()->toArray(),
                'category' => null,
            ],
            [
                'id' => 3,
                'label' => 'Blog',
                'type' => 'page',
                'url' => '/guides',
                'children' => $blogCategories->map(function ($cat) {
                    return [
                        'id' => $cat['id'],
                        'label' => $cat['name'],
                        'type' => 'category',
                        'url' => "/guides/category/{$cat['slug']}",
                        'category' => $cat,
                    ];
                })->values()->toArray(),
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

    private function postCard(GuidePost $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'status' => $post->status,
            'excerpt' => $post->excerpt,
            'featured_image_url' => $post->featured_image_url,
            'featured_image_alt' => $post->featured_image_alt,
            'published_at' => $post->published_at?->toIso8601String(),
            'is_featured' => $post->is_featured,
            'category' => $post->category,
            'author' => $post->user ? ['name' => $post->user->name] : null,
        ];
    }

    private function recordVisit(Request $request, GuidePost $post): void
    {
        $userAgent = substr((string) $request->userAgent(), 0, 1000) ?: null;
        $ipAddress = $request->ip();
        $visitorHash = hash('sha256', implode('|', [$ipAddress, $userAgent]));
        $details = $this->detectPlatform($userAgent);
        $referrerHost = parse_url((string) $request->headers->get('referer'), PHP_URL_HOST) ?: null;

        GuidePostVisit::create([
            'guide_post_id' => $post->id,
            'visitor_hash' => $visitorHash,
            'device_type' => $details['device_type'],
            'browser' => $details['browser'],
            'operating_system' => $details['operating_system'],
            'referrer_host' => $referrerHost,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'visited_at' => now(),
        ]);
    }

    private function analytics(GuidePost $post): array
    {
        $base = GuidePostVisit::query()->where('guide_post_id', $post->id);

        return [
            'total_visits' => (clone $base)->count(),
            'unique_visitors' => (clone $base)->distinct('visitor_hash')->count('visitor_hash'),
            'device_types' => $this->groupVisits($post->id, 'device_type'),
            'browsers' => $this->groupVisits($post->id, 'browser'),
            'operating_systems' => $this->groupVisits($post->id, 'operating_system'),
            'referrers' => $this->groupVisits($post->id, 'referrer_host'),
        ];
    }

    private function recordAnalyticsEvent(Request $request, string $eventName, array $attributes = []): void
    {
        $details = $this->detectPlatform((string) $request->userAgent());

        AnalyticsEvent::create([
            'event_name' => $eventName,
            'path' => $attributes['path'] ?? null,
            'page_title' => $attributes['page_title'] ?? null,
            'target' => $attributes['target'] ?? null,
            'guide_post_id' => $attributes['guide_post_id'] ?? null,
            'guide_category_id' => $attributes['guide_category_id'] ?? null,
            'visitor_hash' => hash('sha256', implode('|', [$request->ip(), (string) $request->userAgent()])),
            'session_hash' => hash('sha256', implode('|', [$request->ip(), (string) $request->headers->get('accept-language'), now()->format('Y-m-d')])),
            'device_type' => $details['device_type'],
            'browser' => $details['browser'],
            'operating_system' => $details['operating_system'],
            'referrer_host' => parse_url((string) $request->headers->get('referer'), PHP_URL_HOST) ?: null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000) ?: null,
            'metadata' => $attributes['metadata'] ?? null,
            'occurred_at' => now(),
        ]);
    }

    private function groupVisits(int $postId, string $column): array
    {
        return GuidePostVisit::query()
            ->where('guide_post_id', $postId)
            ->selectRaw("COALESCE($column, 'Unknown') as label, COUNT(*) as visits")
            ->groupBy(DB::raw("COALESCE($column, 'Unknown')"))
            ->orderByDesc('visits')
            ->limit(6)
            ->get()
            ->map(fn($row) => [
                'label' => $row->label,
                'visits' => (int) $row->visits,
            ])
            ->all();
    }

    private function detectPlatform(?string $userAgent): array
    {
        $ua = strtolower((string) $userAgent);

        $deviceType = str_contains($ua, 'tablet') || str_contains($ua, 'ipad')
            ? 'Tablet'
            : ((str_contains($ua, 'mobile') || str_contains($ua, 'iphone') || str_contains($ua, 'android')) ? 'Mobile' : 'Desktop');

        $browser = match (true) {
            str_contains($ua, 'edg/') => 'Edge',
            str_contains($ua, 'opr/') || str_contains($ua, 'opera') => 'Opera',
            str_contains($ua, 'firefox/') => 'Firefox',
            str_contains($ua, 'chrome/') && !str_contains($ua, 'edg/') && !str_contains($ua, 'opr/') => 'Chrome',
            str_contains($ua, 'safari/') && !str_contains($ua, 'chrome/') => 'Safari',
            str_contains($ua, 'trident/') || str_contains($ua, 'msie') => 'Internet Explorer',
            default => 'Unknown',
        };

        $operatingSystem = match (true) {
            str_contains($ua, 'windows') => 'Windows',
            str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ios') => 'iOS',
            str_contains($ua, 'android') => 'Android',
            str_contains($ua, 'mac os') || str_contains($ua, 'macintosh') => 'macOS',
            str_contains($ua, 'linux') => 'Linux',
            default => 'Unknown',
        };

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'operating_system' => $operatingSystem,
        ];
    }
}
