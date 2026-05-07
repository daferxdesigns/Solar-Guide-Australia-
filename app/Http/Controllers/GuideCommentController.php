<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Services\LeadCaptureService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GuideCommentController extends Controller
{
    public function store(Request $request, GuidePost $post, LeadCaptureService $leadCaptureService): RedirectResponse
    {
        abort_unless(
            $post->status === 'published'
                && $post->published_at !== null
                && $post->published_at->lte(now()),
            404,
        );

        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'author_email' => ['required', 'email', 'max:255'],
            'content' => ['required', 'string', 'min:5', 'max:3000'],
        ]);

        GuidePostComment::create([
            'guide_post_id' => $post->id,
            'author_name' => trim((string) $validated['author_name']),
            'author_email' => strtolower(trim((string) $validated['author_email'])),
            'content' => trim((string) $validated['content']),
            'status' => 'pending',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000) ?: null,
        ]);

        $leadCaptureService->capture('comment_submission', 'Article comment', [
            'name' => $validated['author_name'],
            'email' => $validated['author_email'],
            'message' => trim((string) $validated['content']),
            'payload' => [
                'guide_post_id' => $post->id,
                'guide_post_title' => $post->title,
            ],
        ]);

        AnalyticsEvent::create([
            'event_name' => 'comment_submit',
            'path' => route('guides.show', $post, absolute: false),
            'page_title' => $post->title,
            'guide_post_id' => $post->id,
            'guide_category_id' => $post->guide_category_id,
            'visitor_hash' => hash('sha256', implode('|', [$request->ip(), (string) $request->userAgent()])),
            'session_hash' => hash('sha256', implode('|', [$request->ip(), (string) $request->headers->get('accept-language'), now()->format('Y-m-d')])),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000) ?: null,
            'referrer_host' => parse_url((string) $request->headers->get('referer'), PHP_URL_HOST) ?: null,
            'metadata' => [
                'comment_length' => strlen(trim((string) $validated['content'])),
            ],
            'occurred_at' => now(),
        ]);

        return back()
            ->with('success', 'Comment submitted. It is now waiting for admin approval.')
            ->withFragment('comments');
    }
}
