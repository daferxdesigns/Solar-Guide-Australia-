<?php

namespace App\Http\Controllers;

use App\Models\GuidePost;
use App\Models\GuidePostComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCommentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $postId = trim((string) $request->query('post_id', ''));

        $comments = GuidePostComment::query()
            ->with(['post:id,title,slug'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('author_name', 'like', "%{$search}%")
                        ->orWhere('author_email', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['pending', 'approved', 'rejected'], true), fn ($query) => $query->where('status', $status))
            ->when($postId !== '' && ctype_digit($postId), fn ($query) => $query->where('guide_post_id', (int) $postId))
            ->latest()
            ->paginate(20)
            ->through(fn (GuidePostComment $comment) => [
                'id' => $comment->id,
                'author_name' => $comment->author_name,
                'author_email' => $comment->author_email,
                'content' => $comment->content,
                'status' => $comment->status,
                'created_at' => $comment->created_at?->toIso8601String(),
                'approved_at' => $comment->approved_at?->toIso8601String(),
                'post' => $comment->post ? [
                    'id' => $comment->post->id,
                    'title' => $comment->post->title,
                    'slug' => $comment->post->slug,
                ] : null,
            ])
            ->withQueryString();

        return Inertia::render('Admin/Comments/Index', [
            'comments' => $comments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'post_id' => $postId,
            ],
            'posts' => GuidePost::query()->orderBy('title')->get(['id', 'title', 'slug']),
            'stats' => [
                'total_comments' => GuidePostComment::count(),
                'pending_comments' => GuidePostComment::where('status', 'pending')->count(),
                'approved_comments' => GuidePostComment::where('status', 'approved')->count(),
                'rejected_comments' => GuidePostComment::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function update(Request $request, GuidePostComment $comment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $comment->status = $validated['status'];
        $comment->approved_at = $validated['status'] === 'approved' ? now() : null;
        $comment->save();

        return back()->with('success', 'Comment status updated.');
    }

    public function destroy(GuidePostComment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('success', 'Comment moved to deleted content.');
    }
}
