<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\GuideCategory;
use App\Models\GuidePost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsEventController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_name' => ['required', 'in:click'],
            'path' => ['nullable', 'string', 'max:255'],
            'page_title' => ['nullable', 'string', 'max:255'],
            'target' => ['nullable', 'string', 'max:255'],
            'post_slug' => ['nullable', 'string', 'max:255'],
            'category_slug' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ]);

        AnalyticsEvent::create([
            'event_name' => $validated['event_name'],
            'path' => $validated['path'] ?? null,
            'page_title' => $validated['page_title'] ?? null,
            'target' => $validated['target'] ?? null,
            'guide_post_id' => !empty($validated['post_slug']) ? GuidePost::query()->where('slug', $validated['post_slug'])->value('id') : null,
            'guide_category_id' => !empty($validated['category_slug']) ? GuideCategory::query()->where('slug', $validated['category_slug'])->value('id') : null,
            'visitor_hash' => $this->visitorHash($request),
            'session_hash' => $this->sessionHash($request),
            'device_type' => $this->detectPlatform((string) $request->userAgent())['device_type'],
            'browser' => $this->detectPlatform((string) $request->userAgent())['browser'],
            'operating_system' => $this->detectPlatform((string) $request->userAgent())['operating_system'],
            'referrer_host' => parse_url((string) $request->headers->get('referer'), PHP_URL_HOST) ?: null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000) ?: null,
            'metadata' => $validated['metadata'] ?? null,
            'occurred_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    private function visitorHash(Request $request): string
    {
        return hash('sha256', implode('|', [$request->ip(), (string) $request->userAgent()]));
    }

    private function sessionHash(Request $request): string
    {
        return hash('sha256', implode('|', [$request->ip(), (string) $request->headers->get('accept-language'), now()->format('Y-m-d')]));
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
