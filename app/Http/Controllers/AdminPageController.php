<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminPageController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $homepagePageId = SiteSetting::current()->homepage_page_id;

        $pages = SitePage::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['draft', 'published'], true), fn ($query) => $query->where('status', $status))
            ->latest('updated_at')
            ->paginate(12)
            ->through(fn (SitePage $page) => $this->pageRow($page, $homepagePageId))
            ->withQueryString();

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total_pages' => SitePage::count(),
                'published_pages' => SitePage::where('status', 'published')->count(),
                'draft_pages' => SitePage::where('status', 'draft')->count(),
                'homepage_page_id' => $homepagePageId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Create', [
            'page' => $this->emptyPage(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePage($request);

        $page = new SitePage();
        $this->fillPage($page, $validated, $request);
        $page->created_by = $request->user()?->id;
        $page->updated_by = $request->user()?->id;
        $page->save();

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page created. You can keep editing it below.');
    }

    public function edit(SitePage $page): Response
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => $this->pagePayload($page),
            'isHomepage' => SiteSetting::current()->homepage_page_id === $page->id,
        ]);
    }

    public function update(Request $request, SitePage $page): RedirectResponse
    {
        $validated = $this->validatePage($request, $page);
        $this->fillPage($page, $validated, $request);
        $page->updated_by = $request->user()?->id;
        $page->save();

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page updated.');
    }

    public function destroy(SitePage $page): RedirectResponse
    {
        if ($page->featured_image_path) {
            Storage::disk('public')->delete($page->featured_image_path);
        }

        $settings = SiteSetting::current();
        if ($settings->homepage_page_id === $page->id) {
            $settings->homepage_page_id = null;
            $settings->save();
        }

        $page->delete();

        return redirect()
            ->route('admin.pages.index')
            ->with('success', 'Page deleted.');
    }

    public function preview(SitePage $page): Response
    {
        return Inertia::render('Admin/Pages/Preview', [
            'page' => $this->pagePayload($page),
            'isHomepage' => SiteSetting::current()->homepage_page_id === $page->id,
        ]);
    }

    private function validatePage(Request $request, ?SitePage $page = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,published'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'seo_keywords' => ['nullable', 'string', 'max:1000'],
            'canonical_url' => ['nullable', 'url', 'max:255'],
            'featured_image_alt' => ['nullable', 'string', 'max:255'],
            'featured_image' => ['nullable', 'image', 'max:6144'],
            'published_at' => ['nullable', 'date'],
            'remove_featured_image' => ['nullable', 'boolean'],
        ]);
    }

    private function fillPage(SitePage $page, array $validated, Request $request): void
    {
        $page->title = trim((string) $validated['title']);
        $page->slug = $this->uniqueSlug(
            trim((string) ($validated['slug'] ?? '')) ?: $page->title,
            $page->id,
        );
        $page->status = $validated['status'];
        $page->excerpt = $this->excerpt($validated['excerpt'] ?? null, $validated['content'] ?? null);
        $page->content = $validated['content'] ?? '';
        $page->seo_title = $this->nullableString($validated['seo_title'] ?? null);
        $page->seo_description = $this->nullableString($validated['seo_description'] ?? null);
        $page->seo_keywords = $this->nullableString($validated['seo_keywords'] ?? null);
        $page->canonical_url = $this->nullableString($validated['canonical_url'] ?? null);
        $page->featured_image_alt = $this->nullableString($validated['featured_image_alt'] ?? null);

        if (($validated['remove_featured_image'] ?? false) && $page->featured_image_path) {
            Storage::disk('public')->delete($page->featured_image_path);
            $page->featured_image_path = null;
        }

        if ($request->hasFile('featured_image')) {
            if ($page->featured_image_path) {
                Storage::disk('public')->delete($page->featured_image_path);
            }

            $page->featured_image_path = $request->file('featured_image')->store('pages/featured-images', 'public');
        }

        $page->published_at = $page->status === 'published'
            ? (!empty($validated['published_at']) ? $validated['published_at'] : ($page->published_at ?? now()))
            : (!empty($validated['published_at']) ? $validated['published_at'] : null);
    }

    private function emptyPage(): array
    {
        return [
            'id' => null,
            'title' => '',
            'slug' => '',
            'status' => 'draft',
            'excerpt' => '',
            'content' => '',
            'seo_title' => '',
            'seo_description' => '',
            'seo_keywords' => '',
            'canonical_url' => '',
            'featured_image_url' => null,
            'featured_image_alt' => '',
            'published_at' => '',
            'public_url' => null,
        ];
    }

    private function pagePayload(SitePage $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'excerpt' => $page->excerpt,
            'content' => $page->content,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'seo_keywords' => $page->seo_keywords,
            'canonical_url' => $page->canonical_url,
            'featured_image_url' => $page->featured_image_url,
            'featured_image_alt' => $page->featured_image_alt,
            'published_at' => $page->published_at?->format('Y-m-d\\TH:i'),
            'public_url' => $page->public_url,
            'updated_at' => $page->updated_at?->toIso8601String(),
        ];
    }

    private function pageRow(SitePage $page, ?int $homepagePageId): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'excerpt' => $page->excerpt,
            'updated_at' => $page->updated_at?->toIso8601String(),
            'published_at' => $page->published_at?->toIso8601String(),
            'public_url' => $page->public_url,
            'is_homepage' => $homepagePageId === $page->id,
        ];
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source);
        $base = $base !== '' ? $base : 'page';
        $slug = $base;
        $suffix = 2;

        while (
            SitePage::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
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

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
