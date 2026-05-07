<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Models\GuidePostVisit;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $since = now()->subDays(30);

        $dailyTraffic = collect(range(0, 13))
            ->map(function (int $offset) use ($since) {
                $day = $since->copy()->addDays($offset);

                return [
                    'date' => $day->format('Y-m-d'),
                    'label' => $day->format('d M'),
                    'views' => GuidePostVisit::query()->whereDate('visited_at', $day)->count(),
                    'clicks' => AnalyticsEvent::query()->where('event_name', 'click')->whereDate('occurred_at', $day)->count(),
                ];
            })
            ->all();

        return Inertia::render('dashboard', [
            'stats' => [
                'posts' => GuidePost::count(),
                'published_posts' => GuidePost::where('status', 'published')->count(),
                'categories' => GuideCategory::count(),
                'comments_pending' => GuidePostComment::where('status', 'pending')->count(),
                'users' => User::count(),
                'visits_30d' => GuidePostVisit::query()->where('visited_at', '>=', $since)->count(),
                'unique_visitors_30d' => GuidePostVisit::query()->where('visited_at', '>=', $since)->distinct('visitor_hash')->count('visitor_hash'),
                'clicks_30d' => AnalyticsEvent::query()->where('event_name', 'click')->where('occurred_at', '>=', $since)->count(),
            ],
            'dailyTraffic' => $dailyTraffic,
            'topPosts' => GuidePost::query()
                ->with('category:id,name')
                ->withCount('visits')
                ->orderByDesc('visits_count')
                ->limit(5)
                ->get()
                ->map(fn (GuidePost $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'visits' => $post->visits_count,
                    'category' => $post->category?->name,
                ])
                ->all(),
            'recentComments' => GuidePostComment::query()
                ->with('post:id,title')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (GuidePostComment $comment) => [
                    'id' => $comment->id,
                    'author_name' => $comment->author_name,
                    'status' => $comment->status,
                    'post_title' => $comment->post?->title,
                    'created_at' => Carbon::parse($comment->created_at)->toIso8601String(),
                ])
                ->all(),
        ]);
    }
}
