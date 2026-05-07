<?php

namespace App\Http\Controllers;

use App\Models\AiWriterAccount;
use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\GuidePostVisit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminGuideController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $sort = trim((string) $request->query('sort', 'published_at'));
        $direction = trim((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $postsQuery = GuidePost::query()
            ->with(['category:id,name,slug', 'user:id,name'])
            ->withCount('visits')
            ->withCount([
                'comments',
                'comments as pending_comments_count' => fn ($query) => $query->where('status', 'pending'),
            ])
            ->addSelect([
                'unique_visitors_count' => GuidePostVisit::query()
                    ->selectRaw('COUNT(DISTINCT visitor_hash)')
                    ->whereColumn('guide_post_id', 'guide_posts.id'),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['draft', 'published'], true), fn ($query) => $query->where('status', $status));

        match ($sort) {
            'category' => $postsQuery
                ->leftJoin('guide_categories', 'guide_categories.id', '=', 'guide_posts.guide_category_id')
                ->select('guide_posts.*')
                ->orderBy('guide_categories.name', $direction),
            'status' => $postsQuery->orderBy('status', $direction),
            'traffic' => $postsQuery->orderBy('visits_count', $direction),
            'comments' => $postsQuery->orderBy('comments_count', $direction),
            'published' => $postsQuery->orderBy('published_at', $direction),
            default => $postsQuery->latest('updated_at'),
        };

        $posts = $postsQuery
            ->paginate(12)
            ->through(function (GuidePost $post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'status' => $post->status,
                    'is_featured' => $post->is_featured,
                    'excerpt' => $post->excerpt,
                    'seo_title' => $post->seo_title,
                    'seo_description' => $post->seo_description,
                    'seo_keywords' => $post->seo_keywords,
                    'canonical_url' => $post->canonical_url,
                    'featured_image_url' => $post->featured_image_url,
                    'visits_count' => $post->visits_count,
                    'unique_visitors_count' => (int) ($post->unique_visitors_count ?? 0),
                    'comments_count' => $post->comments_count,
                    'pending_comments_count' => $post->pending_comments_count,
                    'published_at' => $post->published_at?->toIso8601String(),
                    'updated_at' => $post->updated_at?->toIso8601String(),
                    'category' => $post->category ? [
                        'id' => $post->category->id,
                        'name' => $post->category->name,
                        'slug' => $post->category->slug,
                    ] : null,
                    'author' => $post->user ? ['name' => $post->user->name] : null,
                ];
            })
            ->withQueryString();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'stats' => [
                'total_posts' => GuidePost::count(),
                'published_posts' => GuidePost::where('status', 'published')->count(),
                'draft_posts' => GuidePost::where('status', 'draft')->count(),
                'categories' => GuideCategory::count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts/Create', [
            'categories' => $this->categoryOptions(),
            'aiAccounts' => $this->aiAccountOptions(),
            'post' => $this->emptyPost(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePost($request);

        $post = new GuidePost();
        $this->fillPost($post, $validated, $request);
        $post->user_id = $request->user()?->id;
        $post->save();

        return redirect()->route('admin.posts.edit', $post)->with('success', 'Guide post created.');
    }

    public function edit(GuidePost $post): Response
    {
        $post->load(['category:id,name,slug', 'user:id,name']);

        return Inertia::render('Admin/Posts/Edit', [
            'categories' => $this->categoryOptions(),
            'aiAccounts' => $this->aiAccountOptions(),
            'post' => [
                'id' => $post->id,
                'guide_category_id' => $post->guide_category_id,
                'title' => $post->title,
                'slug' => $post->slug,
                'status' => $post->status,
                'is_featured' => $post->is_featured,
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
                'published_at' => $post->published_at?->format('Y-m-d\TH:i'),
                'analytics' => $this->analytics($post),
            ],
        ]);
    }

    public function update(Request $request, GuidePost $post): RedirectResponse
    {
        $validated = $this->validatePost($request);
        $this->fillPost($post, $validated, $request);
        $post->save();

        return redirect()->route('admin.posts.edit', $post)->with('success', 'Guide post updated.');
    }

    public function destroy(GuidePost $post): RedirectResponse
    {
        if ($post->featured_image_path) {
            Storage::disk('public')->delete($post->featured_image_path);
        }

        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', 'Guide post deleted.');
    }

    public function categories(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => GuideCategory::query()
                ->with([
                    'parent:id,name',
                    'children' => fn ($query) => $query
                        ->withCount('posts')
                        ->orderBy('sort_order')
                        ->orderBy('name'),
                ])
                ->withCount('posts')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'parentOptions' => $this->categoryTreeOptions(),
        ]);
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'parent_id' => ['nullable', 'exists:guide_categories,id'],
        ]);

        GuideCategory::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug(GuideCategory::class, $validated['name']),
            'description' => $this->nullableString($validated['description'] ?? null),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function updateCategory(Request $request, GuideCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'parent_id' => ['nullable', 'exists:guide_categories,id'],
        ]);

        $parentId = $validated['parent_id'] ?? null;
        if ($parentId !== null && (int) $parentId === $category->id) {
            return back()->with('error', 'A category cannot be its own parent.');
        }

        $category->update([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug(GuideCategory::class, $validated['name'], $category->id),
            'description' => $this->nullableString($validated['description'] ?? null),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'parent_id' => $parentId,
        ]);

        return back()->with('success', 'Category updated.');
    }

    public function destroyCategory(GuideCategory $category): RedirectResponse
    {
        GuidePost::query()
            ->where('guide_category_id', $category->id)
            ->update(['guide_category_id' => null]);

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }

    public function uploadEditorImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'max:6144'],
        ]);

        $path = $validated['image']->store('guides/editor-images', 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    private function validatePost(Request $request): array
    {
        return $request->validate([
            'guide_category_id' => ['nullable', 'exists:guide_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,published'],
            'is_featured' => ['nullable', 'boolean'],
            'excerpt' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'seo_keywords' => ['nullable', 'string', 'max:1000'],
            'canonical_url' => ['nullable', 'url', 'max:255'],
            'content' => ['nullable', 'string'],
            'featured_image_alt' => ['nullable', 'string', 'max:255'],
            'featured_image' => ['nullable', 'image', 'max:6144'],
            'header_background_mode' => ['nullable', 'in:color,image,none'],
            'header_background_color' => ['nullable', 'string', 'max:20'],
            'header_background_image' => ['nullable', 'image', 'max:6144'],
            'header_background_image_position' => ['nullable', 'string', 'max:50'],
            'header_background_image_size' => ['nullable', 'in:cover,contain,auto,100% 100%'],
            'header_background_image_repeat' => ['nullable', 'in:no-repeat,repeat,repeat-x,repeat-y'],
            'header_overlay_opacity' => ['nullable', 'integer', 'between:0,100'],
            'published_at' => ['nullable', 'date'],
            'remove_featured_image' => ['nullable', 'boolean'],
            'remove_header_background_image' => ['nullable', 'boolean'],
        ]);
    }

    private function fillPost(GuidePost $post, array $validated, Request $request): void
    {
        $post->guide_category_id = $validated['guide_category_id'] ?? null;
        $post->title = trim((string) $validated['title']);
        $post->slug = $this->uniqueSlug(
            GuidePost::class,
            trim((string) ($validated['slug'] ?? '')) ?: $post->title,
            $post->id,
        );
        $post->status = (string) $validated['status'];
        $post->is_featured = (bool) ($validated['is_featured'] ?? false);
        $post->excerpt = $this->excerpt($validated['excerpt'] ?? null, $validated['content'] ?? null);
        $post->seo_title = $this->nullableString($validated['seo_title'] ?? null);
        $post->seo_description = $this->nullableString($validated['seo_description'] ?? null);
        $post->seo_keywords = $this->nullableString($validated['seo_keywords'] ?? null);
        $post->canonical_url = $this->nullableString($validated['canonical_url'] ?? null);
        $post->content = $validated['content'] ?? '';
        $post->featured_image_alt = $this->nullableString($validated['featured_image_alt'] ?? null);
        $post->header_background_mode = $validated['header_background_mode'] ?? 'color';
        $post->header_background_color = $this->nullableString($validated['header_background_color'] ?? '#123524');
        $post->header_background_image_position = $validated['header_background_image_position'] ?? 'center center';
        $post->header_background_image_size = $validated['header_background_image_size'] ?? 'cover';
        $post->header_background_image_repeat = $validated['header_background_image_repeat'] ?? 'no-repeat';
        $post->header_overlay_opacity = (int) ($validated['header_overlay_opacity'] ?? 72);

        if (($validated['remove_featured_image'] ?? false) && $post->featured_image_path) {
            Storage::disk('public')->delete($post->featured_image_path);
            $post->featured_image_path = null;
        }

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image_path) {
                Storage::disk('public')->delete($post->featured_image_path);
            }

            $post->featured_image_path = $request->file('featured_image')->store('guides/featured-images', 'public');
        }

        if (($validated['remove_header_background_image'] ?? false) && $post->header_background_image_path) {
            Storage::disk('public')->delete($post->header_background_image_path);
            $post->header_background_image_path = null;
        }

        if ($request->hasFile('header_background_image')) {
            if ($post->header_background_image_path) {
                Storage::disk('public')->delete($post->header_background_image_path);
            }

            $post->header_background_image_path = $request->file('header_background_image')->store('guides/header-backgrounds', 'public');
        }

        $post->published_at = $post->status === 'published'
            ? (!empty($validated['published_at']) ? $validated['published_at'] : ($post->published_at ?? now()))
            : (!empty($validated['published_at']) ? $validated['published_at'] : null);
    }

    private function emptyPost(): array
    {
        return [
            'id' => null,
            'guide_category_id' => null,
            'title' => '',
            'slug' => '',
            'status' => 'draft',
            'is_featured' => false,
            'excerpt' => '',
            'seo_title' => '',
            'seo_description' => '',
            'seo_keywords' => '',
            'canonical_url' => '',
            'content' => '',
            'featured_image_url' => null,
            'featured_image_alt' => '',
            'header_background_mode' => 'color',
            'header_background_color' => '#123524',
            'header_background_image_url' => null,
            'header_background_image_position' => 'center center',
            'header_background_image_size' => 'cover',
            'header_background_image_repeat' => 'no-repeat',
            'header_overlay_opacity' => 72,
            'published_at' => '',
            'analytics' => $this->emptyAnalytics(),
        ];
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

    private function emptyAnalytics(): array
    {
        return [
            'total_visits' => 0,
            'unique_visitors' => 0,
            'device_types' => [],
            'browsers' => [],
            'operating_systems' => [],
            'referrers' => [],
        ];
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
            ->map(fn ($row) => [
                'label' => $row->label,
                'visits' => (int) $row->visits,
            ])
            ->all();
    }

    private function categoryOptions(): array
    {
        return $this->categoryTreeOptions();
    }

    private function aiAccountOptions(): array
    {
        return AiWriterAccount::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'model'])
            ->map(fn (AiWriterAccount $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'model' => $account->model,
            ])
            ->all();
    }

    private function categoryTreeOptions(?int $ignoreId = null): array
    {
        $categories = GuideCategory::query()
            ->with(['children' => fn ($query) => $query->select(['id', 'parent_id', 'name', 'slug'])->orderBy('sort_order')->orderBy('name')])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'parent_id', 'name', 'slug']);

        $options = [];

        foreach ($categories as $category) {
            if ($ignoreId !== null && $category->id === $ignoreId) {
                continue;
            }

            $options[] = [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ];

            foreach ($category->children as $child) {
                if ($ignoreId !== null && $child->id === $ignoreId) {
                    continue;
                }

                $options[] = [
                    'id' => $child->id,
                    'name' => '— ' . $child->name,
                    'slug' => $child->slug,
                ];
            }
        }

        return $options;
    }

    private function excerpt(?string $excerpt, ?string $content): ?string
    {
        $excerpt = $this->nullableString($excerpt);
        if ($excerpt !== null) {
            return Str::limit($excerpt, 240);
        }

        $plain = trim(strip_tags((string) $content));

        return $plain !== '' ? Str::limit($plain, 240) : null;
    }

    private function uniqueSlug(string $modelClass, string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source);
        $base = $base !== '' ? $base : 'guide';
        $slug = $base;
        $suffix = 2;

        while (
            $modelClass::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
