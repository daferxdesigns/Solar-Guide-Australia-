<?php

namespace Database\Seeders;

use App\Models\GuidePost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GuideFeaturedImageSeeder extends Seeder
{
    public function run(): void
    {
        GuidePost::query()
            ->with('category')
            ->orderBy('id')
            ->get()
            ->each(function (GuidePost $post): void {
                $categorySlug = $post->category?->slug ?? 'solar-guides';
                $theme = $this->themeFor($categorySlug, $post->title);
                $path = 'guides/featured-images/generated-' . $post->slug . '.svg';

                if (
                    $post->featured_image_path
                    && !str_starts_with($post->featured_image_path, 'guides/featured-images/generated-')
                    && Storage::disk('public')->exists($post->featured_image_path)
                ) {
                    return;
                }

                Storage::disk('public')->put($path, $this->svg($post, $theme));

                $post->forceFill([
                    'featured_image_path' => $path,
                    'featured_image_alt' => $post->featured_image_alt ?: $this->altText($post),
                ])->save();
            });
    }

    /**
     * @return array{start:string,end:string,accent:string,soft:string,label:string,icon:string}
     */
    private function themeFor(string $categorySlug, string $title): array
    {
        $normalizedTitle = Str::lower($title);

        if (str_contains($normalizedTitle, 'wi-fi') || str_contains($normalizedTitle, 'wifi')) {
            return [
                'start' => '#0f3d2e',
                'end' => '#1f7a5a',
                'accent' => '#8fd694',
                'soft' => '#d9f7dc',
                'label' => 'Wi-Fi setup',
                'icon' => 'wifi',
            ];
        }

        return match ($categorySlug) {
            'troubleshooting' => [
                'start' => '#1f2937',
                'end' => '#14573e',
                'accent' => '#f0a23b',
                'soft' => '#ffe0a3',
                'label' => 'Troubleshooting',
                'icon' => 'diagnostic',
            ],
            'installation-guides' => [
                'start' => '#123524',
                'end' => '#2f6f4e',
                'accent' => '#f6c453',
                'soft' => '#fff0bd',
                'label' => 'Installation guide',
                'icon' => 'panel',
            ],
            'rebates-and-tariffs' => [
                'start' => '#263238',
                'end' => '#617d36',
                'accent' => '#dbe86b',
                'soft' => '#f4fac4',
                'label' => 'Rebates & tariffs',
                'icon' => 'chart',
            ],
            'solar-home-upgrades' => [
                'start' => '#173b2f',
                'end' => '#7a5c2e',
                'accent' => '#ffc857',
                'soft' => '#ffefbd',
                'label' => 'Home upgrades',
                'icon' => 'home',
            ],
            'solar-rules-and-compliance' => [
                'start' => '#182433',
                'end' => '#385169',
                'accent' => '#8bd3ff',
                'soft' => '#d9f0ff',
                'label' => 'Rules & compliance',
                'icon' => 'document',
            ],
            default => [
                'start' => '#123524',
                'end' => '#5e6f35',
                'accent' => '#f0a23b',
                'soft' => '#f8dfaa',
                'label' => 'Solar article',
                'icon' => 'sun',
            ],
        };
    }

    /**
     * @param array{start:string,end:string,accent:string,soft:string,label:string,icon:string} $theme
     */
    private function svg(GuidePost $post, array $theme): string
    {
        $titleLines = $this->wrap($post->title, 34, 3);
        $category = $this->escape($post->category?->name ?? $theme['label']);
        $label = $this->escape($theme['label']);
        $icon = $this->icon($theme['icon'], $theme['accent'], $theme['soft']);
        $titleTspans = collect($titleLines)
            ->map(fn (string $line, int $index) => '<tspan x="74" dy="' . ($index === 0 ? '0' : '56') . '">' . $this->escape($line) . '</tspan>')
            ->implode('');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="{$this->escape($this->altText($post))}">
    <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="{$theme['start']}"/>
            <stop offset="100%" stop-color="{$theme['end']}"/>
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="20%" r="70%">
            <stop offset="0%" stop-color="{$theme['accent']}" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="{$theme['accent']}" stop-opacity="0"/>
        </radialGradient>
        <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
        </pattern>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)"/>
    <rect width="1200" height="675" fill="url(#glow)"/>
    <rect width="1200" height="675" fill="url(#grid)"/>
    <circle cx="1030" cy="116" r="180" fill="{$theme['accent']}" opacity="0.18"/>
    <circle cx="1045" cy="120" r="82" fill="none" stroke="{$theme['soft']}" stroke-opacity="0.42" stroke-width="3"/>
    <path d="M0 546 C180 482 296 604 462 542 C640 476 772 508 920 558 C1030 594 1116 594 1200 558 L1200 675 L0 675 Z" fill="#07150f" opacity="0.32"/>
    <g transform="translate(770 188)">{$icon}</g>
    <g transform="translate(74 82)">
        <rect width="274" height="48" rx="24" fill="#ffffff" opacity="0.12"/>
        <circle cx="28" cy="24" r="7" fill="{$theme['accent']}"/>
        <text x="48" y="31" font-family="Verdana, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff" letter-spacing="2">{$label}</text>
    </g>
    <text x="74" y="238" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#ffffff">{$titleTspans}</text>
    <text x="74" y="548" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" fill="{$theme['soft']}">{$category}</text>
    <text x="74" y="590" font-family="Verdana, Arial, sans-serif" font-size="18" fill="#ffffff" opacity="0.78">Solar Guides Australia</text>
</svg>
SVG;
    }

    /**
     * @return array<int, string>
     */
    private function wrap(string $text, int $width, int $limit): array
    {
        $lines = explode("\n", wordwrap($text, $width, "\n", false));

        if (count($lines) <= $limit) {
            return $lines;
        }

        $trimmed = array_slice($lines, 0, $limit);
        $trimmed[$limit - 1] = rtrim($trimmed[$limit - 1], ' .,') . '...';

        return $trimmed;
    }

    private function icon(string $name, string $accent, string $soft): string
    {
        return match ($name) {
            'wifi' => <<<SVG
<path d="M54 214c88-88 230-88 318 0" fill="none" stroke="{$soft}" stroke-width="28" stroke-linecap="round" opacity="0.72"/>
<path d="M110 270c57-57 149-57 206 0" fill="none" stroke="{$soft}" stroke-width="28" stroke-linecap="round" opacity="0.86"/>
<path d="M168 326c25-25 65-25 90 0" fill="none" stroke="{$soft}" stroke-width="28" stroke-linecap="round"/>
<circle cx="213" cy="386" r="26" fill="{$accent}"/>
SVG,
            'diagnostic' => <<<SVG
<rect x="72" y="66" width="286" height="228" rx="34" fill="#ffffff" opacity="0.13"/>
<rect x="112" y="112" width="206" height="56" rx="16" fill="{$soft}" opacity="0.88"/>
<path d="M126 234h48l30-48 40 96 34-48h58" fill="none" stroke="{$accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="215" cy="365" r="44" fill="none" stroke="{$soft}" stroke-width="18" opacity="0.8"/>
<path d="M248 398l64 64" stroke="{$accent}" stroke-width="22" stroke-linecap="round"/>
SVG,
            'panel' => <<<SVG
<g transform="rotate(-8 220 220)">
<rect x="60" y="96" width="322" height="198" rx="22" fill="#ffffff" opacity="0.14"/>
<path d="M90 154h262M90 214h262M154 108v174M246 108v174" stroke="{$soft}" stroke-width="10" opacity="0.78"/>
<path d="M160 330h122l34 86H126z" fill="{$accent}" opacity="0.95"/>
</g>
SVG,
            'chart' => <<<SVG
<rect x="78" y="82" width="306" height="306" rx="34" fill="#ffffff" opacity="0.13"/>
<path d="M126 326h218" stroke="{$soft}" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
<rect x="142" y="240" width="42" height="86" rx="10" fill="{$accent}"/>
<rect x="214" y="184" width="42" height="142" rx="10" fill="{$soft}"/>
<rect x="286" y="132" width="42" height="194" rx="10" fill="{$accent}"/>
<path d="M126 184c48-54 98 4 146-48 24-26 45-42 72-54" fill="none" stroke="{$soft}" stroke-width="14" stroke-linecap="round"/>
SVG,
            'home' => <<<SVG
<path d="M70 248 218 120l148 128v154a28 28 0 0 1-28 28H98a28 28 0 0 1-28-28z" fill="#ffffff" opacity="0.14"/>
<path d="M118 252h200" stroke="{$soft}" stroke-width="13" opacity="0.78"/>
<path d="M142 204h152M160 304h116" stroke="{$accent}" stroke-width="18" stroke-linecap="round"/>
<circle cx="340" cy="112" r="44" fill="{$accent}" opacity="0.95"/>
SVG,
            'document' => <<<SVG
<path d="M102 62h206l76 78v260a32 32 0 0 1-32 32H102a32 32 0 0 1-32-32V94a32 32 0 0 1 32-32z" fill="#ffffff" opacity="0.14"/>
<path d="M304 66v86h82" fill="none" stroke="{$soft}" stroke-width="15" opacity="0.85"/>
<path d="M126 212h184M126 270h212M126 328h150" stroke="{$soft}" stroke-width="17" stroke-linecap="round"/>
<path d="m144 396 42 42 92-108" fill="none" stroke="{$accent}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
SVG,
            default => <<<SVG
<circle cx="218" cy="226" r="92" fill="{$accent}" opacity="0.95"/>
<g stroke="{$soft}" stroke-width="18" stroke-linecap="round" opacity="0.78">
<path d="M218 66v-44M218 430v-44M58 226H14M422 226h-44M104 112 73 81M363 381l-31-31M332 112l31-31M73 381l31-31"/>
</g>
<path d="M86 368h286" stroke="{$soft}" stroke-width="24" stroke-linecap="round" opacity="0.65"/>
SVG,
        };
    }

    private function altText(GuidePost $post): string
    {
        return 'Featured image for ' . $post->title;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }
}
