<?php

namespace App\Http\Controllers;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\SitePage;
use App\Models\SiteSetting;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use XMLWriter;

class SitemapController extends Controller
{
    public function robots(): Response
    {
        $settings = SiteSetting::current();
        $content = $settings->robots_txt_content ?: $this->defaultRobotsContent($settings);
        $content = str_replace(
            ['{sitemap_url}', '{{sitemap_url}}'],
            route('sitemap'),
            $content,
        );

        return response(rtrim($content) . "\n", 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    public function sitemap(): Response
    {
        $settings = SiteSetting::current();

        if (! ($settings->seo_indexing_enabled ?? true) || ! ($settings->sitemap_enabled ?? true)) {
            return response($this->xml([]), 200, [
                'Content-Type' => 'application/xml; charset=UTF-8',
            ]);
        }

        $latestPost = GuidePost::query()
            ->published()
            ->latest('updated_at')
            ->first(['updated_at']);

        $urls = collect([
            [
                'loc' => route('home'),
                'lastmod' => $settings->updated_at?->toAtomString(),
            ],
            [
                'loc' => route('guides.index'),
                'lastmod' => $latestPost?->updated_at?->toAtomString(),
            ],
        ]);

        $urls = $urls
            ->merge(($settings->sitemap_include_categories ?? true) ? $this->categoryUrls() : collect())
            ->merge(($settings->sitemap_include_posts ?? true) ? $this->postUrls() : collect())
            ->merge(($settings->sitemap_include_pages ?? true) ? $this->pageUrls($settings) : collect())
            ->merge($this->extraUrls($settings))
            ->unique('loc')
            ->values()
            ->all();

        return response($this->xml($urls), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function categoryUrls(): Collection
    {
        return GuideCategory::query()
            ->withCount([
                'posts as published_posts_count' => fn ($query) => $query->published(),
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->filter(fn (GuideCategory $category) => $category->published_posts_count > 0)
            ->map(fn (GuideCategory $category) => [
                'loc' => route('guides.category', ['category' => $category->slug]),
                'lastmod' => $category->updated_at?->toAtomString(),
            ]);
    }

    private function postUrls(): Collection
    {
        return GuidePost::query()
            ->published()
            ->latest('updated_at')
            ->get(['id', 'slug', 'canonical_url', 'updated_at', 'published_at'])
            ->map(fn (GuidePost $post) => [
                'loc' => $this->localCanonicalOrUrl($post->canonical_url, route('guides.show', ['post' => $post->slug])),
                'lastmod' => ($post->updated_at ?? $post->published_at)?->toAtomString(),
            ]);
    }

    private function pageUrls(SiteSetting $settings): Collection
    {
        return SitePage::query()
            ->published()
            ->when(
                $settings->custom_homepage_enabled && $settings->homepage_page_id,
                fn ($query) => $query->whereKeyNot($settings->homepage_page_id),
            )
            ->latest('updated_at')
            ->get(['id', 'slug', 'canonical_url', 'updated_at'])
            ->map(fn (SitePage $page) => [
                'loc' => $this->localCanonicalOrUrl($page->canonical_url, $page->public_url),
                'lastmod' => $page->updated_at?->toAtomString(),
            ]);
    }

    private function extraUrls(SiteSetting $settings): Collection
    {
        $lines = preg_split('/\R/', (string) $settings->sitemap_extra_urls) ?: [];

        return collect($lines)
            ->map(fn (string $line) => trim($line))
            ->filter()
            ->map(fn (string $url) => [
                'loc' => $this->absoluteUrl($url),
                'lastmod' => null,
            ])
            ->filter(fn (array $url) => $url['loc'] !== null);
    }

    private function localCanonicalOrUrl(?string $canonicalUrl, string $fallbackUrl): string
    {
        $canonicalUrl = trim((string) $canonicalUrl);

        if ($canonicalUrl === '') {
            return $fallbackUrl;
        }

        if (! Str::startsWith($canonicalUrl, ['http://', 'https://'])) {
            return url($canonicalUrl);
        }

        $appHost = parse_url(config('app.url'), PHP_URL_HOST);
        $canonicalHost = parse_url($canonicalUrl, PHP_URL_HOST);

        return $appHost && $canonicalHost === $appHost ? $canonicalUrl : $fallbackUrl;
    }

    private function absoluteUrl(string $url): ?string
    {
        if (str_starts_with($url, '#')) {
            return null;
        }

        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        if (Str::startsWith($url, ['/'])) {
            return url($url);
        }

        return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
    }

    private function defaultRobotsContent(SiteSetting $settings): string
    {
        if (! ($settings->seo_indexing_enabled ?? true)) {
            return implode("\n", [
                'User-agent: *',
                'Disallow: /',
                '',
                'Sitemap: ' . route('sitemap'),
            ]);
        }

        return implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin/',
            'Disallow: /dashboard',
            'Disallow: /login',
            'Disallow: /register',
            '',
            'Sitemap: ' . route('sitemap'),
        ]);
    }

    private function xml(array $urls): string
    {
        $xml = new XMLWriter();
        $xml->openMemory();
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('urlset');
        $xml->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        foreach ($urls as $url) {
            $xml->startElement('url');
            $xml->writeElement('loc', $url['loc']);

            if (! empty($url['lastmod'])) {
                $xml->writeElement('lastmod', $url['lastmod']);
            }

            $xml->endElement();
        }

        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }
}
