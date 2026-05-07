<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class AdminChatController extends Controller
{
    private const MAX_ATTACHMENT_KB = 20480;

    public function index(Request $request): Response
    {
        $selectedId = (int) $request->query('conversation', 0);
        return Inertia::render('Admin/Chats/Index', [
            ...$this->chatPayload($selectedId),
        ]);
    }

    public function reply(Request $request, ChatConversation $conversation): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:2000', 'required_without:attachment'],
            'attachment' => ['nullable', 'file', 'max:' . self::MAX_ATTACHMENT_KB, 'required_without:message'],
        ]);

        ChatMessage::query()->create([
            'chat_conversation_id' => $conversation->id,
            'user_id' => $request->user()?->id,
            'sender_type' => 'admin',
            'body' => $this->nullableString($validated['message'] ?? null),
            ...$this->storeAttachment($request->file('attachment')),
        ]);

        $conversation->forceFill([
            'status' => 'open',
            'last_message_at' => now(),
            'admin_typing_at' => null,
        ])->save();

        return redirect()
            ->route('admin.chats.index', ['conversation' => $conversation->id])
            ->with('success', 'Reply sent.');
    }

    public function replyJson(Request $request, ChatConversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:2000', 'required_without:attachment'],
            'attachment' => ['nullable', 'file', 'max:' . self::MAX_ATTACHMENT_KB, 'required_without:message'],
        ]);

        ChatMessage::query()->create([
            'chat_conversation_id' => $conversation->id,
            'user_id' => $request->user()?->id,
            'sender_type' => 'admin',
            'body' => $this->nullableString($validated['message'] ?? null),
            ...$this->storeAttachment($request->file('attachment')),
        ]);

        $conversation->forceFill([
            'status' => 'open',
            'last_message_at' => now(),
            'admin_typing_at' => null,
        ])->save();

        return response()->json($this->chatPayload($conversation->id));
    }

    public function data(Request $request): JsonResponse
    {
        $selectedId = (int) $request->query('conversation', 0);

        return response()->json($this->chatPayload($selectedId));
    }

    public function typing(ChatConversation $conversation): JsonResponse
    {
        $conversation->forceFill([
            'admin_typing_at' => now(),
        ])->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function close(ChatConversation $conversation): RedirectResponse
    {
        $conversation->forceFill(['status' => 'closed'])->save();

        return redirect()
            ->route('admin.chats.index', ['conversation' => $conversation->id])
            ->with('success', 'Chat closed.');
    }

    public function open(ChatConversation $conversation): RedirectResponse
    {
        $conversation->forceFill(['status' => 'open'])->save();

        return redirect()
            ->route('admin.chats.index', ['conversation' => $conversation->id])
            ->with('success', 'Chat reopened.');
    }

    public function complete(ChatConversation $conversation): RedirectResponse
    {
        $conversation->forceFill(['status' => 'completed'])->save();

        return redirect()
            ->route('admin.chats.index')
            ->with('success', 'Chat marked completed.');
    }

    public function destroy(ChatConversation $conversation): RedirectResponse
    {
        $conversation->delete();

        return redirect()
            ->route('admin.chats.index')
            ->with('success', 'Chat removed from the active list.');
    }

    private function chatPayload(int $selectedId): array
    {
        $conversations = ChatConversation::query()
            ->with(['messages' => fn ($query) => $query->latest()->limit(1)])
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('sender_type', 'visitor')
                    ->whereNull('read_at'),
                'messages as total_messages_count' => fn ($query) => $query->where('sender_type', 'visitor'),
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get();

        $selected = $selectedId
            ? ChatConversation::query()->with('messages')->find($selectedId)
            : $conversations->first();

        if ($selected) {
            $selected->messages()
                ->where('sender_type', 'visitor')
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $selected->forceFill([
                'admin_last_seen_at' => now(),
            ])->save();

            $selected->refresh();
        }

        return [
            'conversations' => $conversations->map(fn (ChatConversation $conversation) => [
                'id' => $conversation->id,
                'visitor_name' => $conversation->visitor_name,
                'visitor_email' => $conversation->visitor_email,
                'visitor_phone' => $conversation->visitor_phone,
                'status' => $conversation->status,
                'unread_count' => $conversation->unread_count,
                'is_new' => $conversation->unread_count > 0 && $conversation->admin_last_seen_at === null && $conversation->total_messages_count > 0,
                'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                'last_message' => $conversation->messages->first()?->body
                    ?: $conversation->messages->first()?->attachment_name,
                'visitor_typing' => $conversation->visitor_typing_at?->gt(now()->subSeconds(6)) ?? false,
            ])->all(),
            'selectedConversation' => $selected ? [
                'id' => $selected->id,
                'visitor_name' => $selected->visitor_name,
                'visitor_email' => $selected->visitor_email,
                'visitor_phone' => $selected->visitor_phone,
                'status' => $selected->status,
                'last_message_at' => $selected->last_message_at?->toIso8601String(),
                'visitor_last_seen_at' => $selected->visitor_last_seen_at?->toIso8601String(),
                'admin_last_seen_at' => $selected->admin_last_seen_at?->toIso8601String(),
                'visitor_typing' => $selected->visitor_typing_at?->gt(now()->subSeconds(6)) ?? false,
                'admin_typing' => $selected->admin_typing_at?->gt(now()->subSeconds(6)) ?? false,
                'messages' => $selected->messages()
                    ->oldest()
                    ->get()
                    ->map(fn (ChatMessage $message) => $this->formatMessage($message))
                    ->all(),
            ] : null,
        ];
    }

    private function formatMessage(ChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'sender_type' => $message->sender_type,
            'body' => $message->body,
            'created_at' => $message->created_at?->toIso8601String(),
            'read_at' => $message->read_at?->toIso8601String(),
            'attachment_url' => $message->attachment_url,
            'attachment_name' => $message->attachment_name,
            'attachment_mime' => $message->attachment_mime,
            'attachment_size' => $message->attachment_size,
            'attachment_is_image' => $message->attachment_is_image,
        ];
    }

    private function storeAttachment(?UploadedFile $file): array
    {
        if (! $file) {
            return [
                'attachment_path' => null,
                'attachment_name' => null,
                'attachment_mime' => null,
                'attachment_size' => null,
            ];
        }

        return [
            'attachment_path' => $file->store('chat-attachments', 'public'),
            'attachment_name' => $file->getClientOriginalName(),
            'attachment_mime' => $file->getClientMimeType(),
            'attachment_size' => $file->getSize(),
        ];
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
