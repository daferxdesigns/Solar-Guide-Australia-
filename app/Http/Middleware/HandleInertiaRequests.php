<?php

namespace App\Http\Middleware;

use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Models\SiteSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'calculator_success' => fn () => $request->session()->get('calculator_success'),
                'contact_success' => fn () => $request->session()->get('contact_success'),
            ],
            'adminNotifications' => fn () => $request->user() ? $this->notifications() : [],
            'siteSettings' => fn () => [
                'site_title' => SiteSetting::current()->site_title,
            ],
        ]);
    }

    private function notifications(): array
    {
        $postItems = GuidePost::query()
            ->latest()
            ->limit(4)
            ->get(['id', 'title', 'created_at', 'updated_at'])
            ->map(fn (GuidePost $post) => [
                'id' => 'post-' . $post->id,
                'type' => 'post',
                'title' => $post->updated_at && $post->updated_at->gt($post->created_at) ? 'Post updated' : 'New post',
                'description' => $post->title,
                'href' => "/admin/posts/{$post->id}/edit",
                'created_at' => ($post->updated_at ?? $post->created_at)?->toIso8601String(),
            ]);

        $commentItems = GuidePostComment::query()
            ->latest()
            ->limit(6)
            ->get(['id', 'author_name', 'status', 'created_at', 'updated_at'])
            ->map(fn (GuidePostComment $comment) => [
                'id' => 'comment-' . $comment->id,
                'type' => 'comment',
                'title' => match ($comment->status) {
                    'approved' => $comment->updated_at && $comment->updated_at->gt($comment->created_at) ? 'Comment approved' : 'New comment',
                    'rejected' => 'Comment rejected',
                    default => 'New comment',
                },
                'description' => $comment->status === 'pending'
                    ? "{$comment->author_name} is awaiting approval"
                    : $comment->author_name,
                'href' => '/admin/comments',
                'created_at' => ($comment->updated_at ?? $comment->created_at)?->toIso8601String(),
            ]);

        return $postItems
            ->concat($commentItems)
            ->sortByDesc('created_at')
            ->take(8)
            ->values()
            ->all();
    }
}
