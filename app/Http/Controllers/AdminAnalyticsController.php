<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\GuidePost;
use App\Models\GuidePostVisit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $range = (string) $request->query('range', '30');
        $days = match ($range) {
            '7' => 7,
            '90' => 90,
            '365' => 365,
            default => 30,
        };

        $since = now()->subDays($days - 1)->startOfDay();

        $visits = GuidePostVisit::query()->where('visited_at', '>=', $since);
        $events = AnalyticsEvent::query()->where('occurred_at', '>=', $since);

        return Inertia::render('Admin/Analytics/Index', [
            'range' => $range,
            'stats' => [
                'page_views' => (clone $events)->whereIn('event_name', ['page_view', 'category_view', 'article_view'])->count(),
                'article_views' => (clone $visits)->count(),
                'unique_visitors' => (clone $visits)->distinct('visitor_hash')->count('visitor_hash'),
                'clicks' => (clone $events)->where('event_name', 'click')->count(),
                'comment_submissions' => (clone $events)->where('event_name', 'comment_submit')->count(),
            ],
            'dailyTraffic' => $this->dailyTraffic($since, $days),
            'topArticles' => GuidePostVisit::query()
                ->select('guide_post_id', DB::raw('COUNT(*) as views'))
                ->where('visited_at', '>=', $since)
                ->whereNotNull('guide_post_id')
                ->groupBy('guide_post_id')
                ->orderByDesc('views')
                ->limit(10)
                ->get()
                ->map(function ($row) {
                    $post = GuidePost::query()->find($row->guide_post_id, ['id', 'title', 'slug']);

                    return [
                        'title' => $post?->title ?? 'Unknown article',
                        'slug' => $post?->slug,
                        'views' => (int) $row->views,
                    ];
                })
                ->all(),
            'clickTargets' => $this->groupEventCounts($since, 'click', 'target'),
            'devices' => $this->visitGroupCounts($since, 'device_type'),
            'browsers' => $this->visitGroupCounts($since, 'browser'),
            'operatingSystems' => $this->visitGroupCounts($since, 'operating_system'),
            'referrers' => $this->visitGroupCounts($since, 'referrer_host'),
            'topPages' => (clone $events)
                ->selectRaw("COALESCE(path, 'Unknown') as label, COUNT(*) as total")
                ->whereIn('event_name', ['page_view', 'category_view', 'article_view'])
                ->groupBy(DB::raw("COALESCE(path, 'Unknown')"))
                ->orderByDesc('total')
                ->limit(10)
                ->get()
                ->map(fn ($row) => [
                    'label' => $row->label,
                    'total' => (int) $row->total,
                ])
                ->all(),
        ]);
    }

    private function dailyTraffic(Carbon $since, int $days): array
    {
        return collect(range(0, $days - 1))
            ->map(function (int $offset) use ($since) {
                $day = $since->copy()->addDays($offset);

                return [
                    'date' => $day->format('Y-m-d'),
                    'label' => $day->format('d M'),
                    'views' => AnalyticsEvent::query()
                        ->whereIn('event_name', ['page_view', 'category_view', 'article_view'])
                        ->whereDate('occurred_at', $day)
                        ->count(),
                    'clicks' => AnalyticsEvent::query()
                        ->where('event_name', 'click')
                        ->whereDate('occurred_at', $day)
                        ->count(),
                ];
            })
            ->all();
    }

    private function groupEventCounts(Carbon $since, string $eventName, string $column): array
    {
        return AnalyticsEvent::query()
            ->where('event_name', $eventName)
            ->where('occurred_at', '>=', $since)
            ->selectRaw("COALESCE($column, 'Unknown') as label, COUNT(*) as total")
            ->groupBy(DB::raw("COALESCE($column, 'Unknown')"))
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label,
                'total' => (int) $row->total,
            ])
            ->all();
    }

    private function visitGroupCounts(Carbon $since, string $column): array
    {
        return GuidePostVisit::query()
            ->where('visited_at', '>=', $since)
            ->selectRaw("COALESCE($column, 'Unknown') as label, COUNT(*) as total")
            ->groupBy(DB::raw("COALESCE($column, 'Unknown')"))
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label,
                'total' => (int) $row->total,
            ])
            ->all();
    }
}
