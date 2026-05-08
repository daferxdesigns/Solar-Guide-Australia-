<?php

namespace App\Services;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\SitePage;
use App\Models\SiteSetting;
use Illuminate\Support\Str;

class SeoMetaBuilder
{
    private const DEFAULT_SITE_NAME = 'Solar Support Australia';

    public function listing(SiteSetting $settings, string $canonicalUrl): array
    {
        $title = $settings->default_seo_title
            ?: $this->siteName($settings) . ' | Solar Guides, Inverter Wi-Fi Help and Rebates';

        $description = $settings->default_seo_description
            ?: ($settings->site_tagline
                ?: 'Australia-focused solar guides, inverter Wi-Fi setup articles, troubleshooting help, battery rebate updates and solar policy news.');

        return $this->build($settings, [
            'title' => $title,
            'description' => $description,
            'canonical_url' => $canonicalUrl,
            'type' => 'website',
            'schema' => [
                $this->organizationSchema($settings),
                $this->websiteSchema($settings, $description),
                $this->webPageSchema('CollectionPage', $title, $description, $canonicalUrl),
            ],
        ]);
    }

    public function category(GuideCategory $category, SiteSetting $settings): array
    {
        $title = "{$category->name} | " . $this->siteName($settings);
        $description = $category->description ?: "Browse {$category->name} articles on " . $this->siteName($settings) . '.';
        $canonicalUrl = route('guides.category', ['category' => $category->slug]);

        return $this->build($settings, [
            'title' => $title,
            'description' => $description,
            'keywords' => implode(', ', array_filter([
                $category->name,
                "{$category->name} Australia",
                $settings->default_seo_keywords,
            ])),
            'canonical_url' => $canonicalUrl,
            'type' => 'website',
            'schema' => [
                $this->organizationSchema($settings),
                $this->webPageSchema('CollectionPage', $title, $description, $canonicalUrl),
                $this->breadcrumbSchema([
                    ['name' => 'Home', 'url' => route('home')],
                    ['name' => 'Guides', 'url' => route('guides.index')],
                    ['name' => $category->name, 'url' => $canonicalUrl],
                ]),
            ],
        ]);
    }

    public function post(GuidePost $post, SiteSetting $settings): array
    {
        $title = $post->seo_title ?: $post->title . ' | ' . $this->siteName($settings);
        $description = $post->seo_description ?: ($post->excerpt ?: ($settings->default_seo_description ?: $settings->site_tagline));
        $canonicalUrl = $post->canonical_url ?: route('guides.show', ['post' => $post->slug]);
        $imageUrl = $this->absoluteUrl($post->featured_image_url ?: $settings->default_og_image_url);

        $primarySchema = $this->postPrimarySchema($post, $settings, $description, $canonicalUrl, $imageUrl);

        $breadcrumbs = [
            ['name' => 'Home', 'url' => route('home')],
            ['name' => 'Guides', 'url' => route('guides.index')],
        ];

        if ($post->category) {
            $breadcrumbs[] = [
                'name' => $post->category->name,
                'url' => route('guides.category', ['category' => $post->category->slug]),
            ];
        }

        $breadcrumbs[] = ['name' => $post->title, 'url' => $canonicalUrl];

        return $this->build($settings, [
            'title' => $title,
            'description' => $description,
            'keywords' => $post->seo_keywords ?: $settings->default_seo_keywords,
            'canonical_url' => $canonicalUrl,
            'image' => $imageUrl,
            'type' => 'article',
            'published_time' => $post->published_at?->toIso8601String(),
            'modified_time' => $post->updated_at?->toIso8601String(),
            'schema' => [
                $this->organizationSchema($settings),
                $primarySchema,
                $this->breadcrumbSchema($breadcrumbs),
            ],
        ]);
    }

    private function postPrimarySchema(GuidePost $post, SiteSetting $settings, ?string $description, string $canonicalUrl, ?string $imageUrl): array
    {
        $schemaType = $this->postSchemaType($post->schema_type ?? null);
        $cleanDescription = $this->cleanDescription($description);
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $schemaType,
            'name' => $this->cleanText($post->title),
            'description' => $cleanDescription,
            'url' => $this->absoluteUrl($canonicalUrl),
            'inLanguage' => 'en-AU',
        ];

        if (in_array($schemaType, ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'], true)) {
            $schema = array_merge($schema, [
                'headline' => $this->cleanText($post->title),
                'mainEntityOfPage' => $this->absoluteUrl($canonicalUrl),
                'datePublished' => $post->published_at?->toIso8601String(),
                'dateModified' => $post->updated_at?->toIso8601String(),
                'author' => [
                    '@type' => 'Person',
                    'name' => $post->user?->name ?: $this->siteName($settings),
                ],
                'publisher' => [
                    '@id' => url('/#organization'),
                ],
            ]);
        }

        if ($schemaType === 'HowTo') {
            $schema = array_merge($schema, [
                'mainEntityOfPage' => $this->absoluteUrl($canonicalUrl),
                'datePublished' => $post->published_at?->toIso8601String(),
                'dateModified' => $post->updated_at?->toIso8601String(),
                'author' => [
                    '@type' => 'Person',
                    'name' => $post->user?->name ?: $this->siteName($settings),
                ],
                'publisher' => [
                    '@id' => url('/#organization'),
                ],
            ]);
        }

        if ($schemaType === 'FAQPage') {
            $schema['mainEntityOfPage'] = $this->absoluteUrl($canonicalUrl);
        }

        if ($schemaType === 'WebPage') {
            $schema['isPartOf'] = [
                '@id' => url('/#website'),
            ];
            $schema['dateModified'] = $post->updated_at?->toIso8601String();
        }

        if ($imageUrl) {
            $schema['image'] = [$imageUrl];
        }

        if (is_array($post->schema_custom_json) && $post->schema_custom_json !== []) {
            $schema = array_replace_recursive($schema, $post->schema_custom_json);
            $schema['@context'] = 'https://schema.org';
            $schema['@type'] = $schemaType;
        }

        return array_filter($schema, fn ($value) => $value !== null && $value !== '');
    }

    private function postSchemaType(?string $schemaType): string
    {
        return in_array($schemaType, ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'HowTo', 'FAQPage', 'WebPage'], true)
            ? $schemaType
            : 'Article';
    }

    public function page(SitePage $page, SiteSetting $settings, bool $isHomepage = false): array
    {
        $title = $page->seo_title ?: $page->title . ' | ' . $this->siteName($settings);
        $description = $page->seo_description ?: ($page->excerpt ?: ($settings->default_seo_description ?: $settings->site_tagline));
        $canonicalUrl = $page->canonical_url ?: ($isHomepage ? route('home') : $page->public_url);
        $imageUrl = $this->absoluteUrl($page->featured_image_url ?: $settings->default_og_image_url);

        return $this->build($settings, [
            'title' => $title,
            'description' => $description,
            'keywords' => $page->seo_keywords ?: $settings->default_seo_keywords,
            'canonical_url' => $canonicalUrl,
            'image' => $imageUrl,
            'type' => 'website',
            'modified_time' => $page->updated_at?->toIso8601String(),
            'schema' => [
                $this->organizationSchema($settings),
                $this->webPageSchema('WebPage', $title, $description, $canonicalUrl, $page->updated_at?->toIso8601String()),
                $this->breadcrumbSchema([
                    ['name' => 'Home', 'url' => route('home')],
                    ['name' => $page->title, 'url' => $canonicalUrl],
                ]),
            ],
        ]);
    }

    private function build(SiteSetting $settings, array $overrides): array
    {
        $title = $this->cleanText(($overrides['title'] ?? null) ?: ($settings->default_seo_title ?: $this->siteName($settings)));
        $description = $this->cleanDescription(($overrides['description'] ?? null) ?: ($settings->default_seo_description ?: $settings->site_tagline));
        $canonicalUrl = $this->absoluteUrl($overrides['canonical_url'] ?? url()->current());
        $imageUrl = $this->absoluteUrl($overrides['image'] ?? $settings->default_og_image_url);

        return [
            'title' => $title,
            'description' => $description,
            'keywords' => $this->cleanText($overrides['keywords'] ?? $settings->default_seo_keywords ?? ''),
            'canonical_url' => $canonicalUrl,
            'image' => $imageUrl,
            'type' => $overrides['type'] ?? 'website',
            'site_name' => $this->siteName($settings),
            'robots' => ($settings->seo_indexing_enabled ?? true)
                ? 'index, follow, max-image-preview:large'
                : 'noindex, nofollow',
            'published_time' => $overrides['published_time'] ?? null,
            'modified_time' => $overrides['modified_time'] ?? null,
            'schema' => array_values(array_filter($overrides['schema'] ?? [])),
        ];
    }

    private function organizationSchema(SiteSetting $settings): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => url('/#organization'),
            'name' => $this->siteName($settings),
            'url' => url('/'),
            'logo' => url('/logo.svg'),
        ];
    }

    private function websiteSchema(SiteSetting $settings, ?string $description): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => url('/#website'),
            'url' => url('/'),
            'name' => $this->siteName($settings),
            'description' => $this->cleanDescription($description),
            'publisher' => [
                '@id' => url('/#organization'),
            ],
            'inLanguage' => 'en-AU',
        ];
    }

    private function webPageSchema(string $type, string $title, ?string $description, string $canonicalUrl, ?string $modifiedTime = null): array
    {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $type,
            'name' => $this->cleanText($title),
            'description' => $this->cleanDescription($description),
            'url' => $this->absoluteUrl($canonicalUrl),
            'isPartOf' => [
                '@id' => url('/#website'),
            ],
            'inLanguage' => 'en-AU',
        ];

        if ($modifiedTime) {
            $schema['dateModified'] = $modifiedTime;
        }

        return $schema;
    }

    private function breadcrumbSchema(array $items): array
    {
        $elements = [];

        foreach (array_values($items) as $index => $item) {
            $elements[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $this->cleanText($item['name'] ?? ''),
                'item' => $this->absoluteUrl($item['url'] ?? url('/')),
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $elements,
        ];
    }

    private function siteName(SiteSetting $settings): string
    {
        return $this->cleanText($settings->site_title ?: self::DEFAULT_SITE_NAME);
    }

    private function cleanDescription(?string $value): string
    {
        $description = $this->cleanText($value);

        return Str::limit($description, 300, '');
    }

    private function cleanText(?string $value): string
    {
        $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text) ?? '';

        return trim($text);
    }

    private function absoluteUrl(?string $url): ?string
    {
        $url = trim((string) $url);

        if ($url === '') {
            return null;
        }

        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        return url($url);
    }
}
