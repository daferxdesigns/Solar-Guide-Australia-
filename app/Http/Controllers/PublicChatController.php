<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\LeadCaptureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class PublicChatController extends Controller
{
    private const SESSION_TIMEOUT_HOURS = 5;
    private const MAX_ATTACHMENT_KB = 20480;

    public function start(Request $request, LeadCaptureService $leadCaptureService): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        $conversation = ChatConversation::query()
            ->where('session_id', $request->session()->getId())
            ->latest('id')
            ->get()
            ->first(fn (ChatConversation $conversation) => !$this->isExpired($conversation));

        if (!$conversation) {
            $conversation = ChatConversation::query()->create([
                'session_id' => $request->session()->getId(),
                'visitor_name' => trim((string) $validated['name']),
                'visitor_email' => strtolower(trim((string) $validated['email'])),
                'visitor_phone' => trim((string) $validated['phone']),
                'status' => 'open',
                'last_message_at' => now(),
                'visitor_last_seen_at' => now(),
            ]);

            $leadCaptureService->capture('live_chat', 'Live chat', [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'message' => 'Live chat session opened.',
                'payload' => [
                    'conversation_id' => $conversation->id,
                    'session_id' => $request->session()->getId(),
                ],
            ]);
        }

        $conversation->forceFill([
            'visitor_name' => trim((string) $validated['name']),
            'visitor_email' => strtolower(trim((string) $validated['email'])),
            'visitor_phone' => trim((string) $validated['phone']),
            'status' => 'open',
            'last_message_at' => $conversation->last_message_at ?: now(),
            'visitor_last_seen_at' => now(),
        ])->save();

        return response()->json([
            'conversation' => $this->conversationPayload($conversation->fresh()),
            'messages' => $this->messagePayload($conversation->fresh()),
        ], 201);
    }

    public function messages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'integer', 'exists:chat_conversations,id'],
        ]);

        $conversation = $this->findSessionConversation($request, (int) $validated['conversation_id']);

        $conversation->messages()
            ->where('sender_type', 'admin')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->forceFill([
            'visitor_last_seen_at' => now(),
        ])->save();

        return response()->json([
            'conversation' => $this->conversationPayload($conversation),
            'messages' => $this->messagePayload($conversation),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'integer', 'exists:chat_conversations,id'],
            'message' => ['nullable', 'string', 'max:2000', 'required_without:attachment'],
            'attachment' => ['nullable', 'file', 'max:' . self::MAX_ATTACHMENT_KB, 'required_without:message'],
        ]);

        $conversation = $this->findSessionConversation($request, (int) $validated['conversation_id']);

        if (in_array($conversation->status, ['closed', 'completed'], true)) {
            abort(423, 'This chat is not active right now. Please wait for support to reopen it.');
        }

        $conversation->forceFill([
            'last_message_at' => now(),
            'visitor_last_seen_at' => now(),
            'visitor_typing_at' => null,
        ])->save();

        ChatMessage::query()->create([
            'chat_conversation_id' => $conversation->id,
            'sender_type' => 'visitor',
            'body' => $this->nullableString($validated['message'] ?? null),
            ...$this->storeAttachment($request->file('attachment')),
        ]);

        return response()->json([
            'conversation' => $this->conversationPayload($conversation->fresh()),
            'messages' => $this->messagePayload($conversation->fresh()),
        ], 201);
    }

    public function typing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'integer', 'exists:chat_conversations,id'],
        ]);

        $conversation = $this->findSessionConversation($request, (int) $validated['conversation_id']);
        $conversation->forceFill([
            'visitor_typing_at' => now(),
        ])->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    private function messagePayload(ChatConversation $conversation): array
    {
        return $conversation->messages()
            ->oldest()
            ->get()
            ->map(fn (ChatMessage $message) => $this->formatMessage($message))
            ->all();
    }

    private function conversationPayload(ChatConversation $conversation): array
    {
        $conversation->refresh();

        return [
            'id' => $conversation->id,
            'visitor_name' => $conversation->visitor_name,
            'visitor_email' => $conversation->visitor_email,
            'visitor_phone' => $conversation->visitor_phone,
            'status' => $conversation->status,
            'last_message_at' => $conversation->last_message_at?->toIso8601String(),
            'visitor_last_seen_at' => $conversation->visitor_last_seen_at?->toIso8601String(),
            'admin_last_seen_at' => $conversation->admin_last_seen_at?->toIso8601String(),
            'visitor_typing' => $conversation->visitor_typing_at?->gt(now()->subSeconds(6)) ?? false,
            'admin_typing' => $conversation->admin_typing_at?->gt(now()->subSeconds(6)) ?? false,
            'expires_at' => $this->sessionAnchor($conversation)?->copy()->addHours(self::SESSION_TIMEOUT_HOURS)->toIso8601String(),
        ];
    }

    private function findSessionConversation(Request $request, int $conversationId): ChatConversation
    {
        $conversation = ChatConversation::query()
            ->whereKey($conversationId)
            ->where('session_id', $request->session()->getId())
            ->firstOrFail();

        if ($this->isExpired($conversation)) {
            abort(410, 'This chat session expired after 5 hours of inactivity.');
        }

        return $conversation;
    }

    private function isExpired(ChatConversation $conversation): bool
    {
        $anchor = $this->sessionAnchor($conversation);

        if (!$anchor) {
            return true;
        }

        return $anchor->lt(now()->subHours(self::SESSION_TIMEOUT_HOURS));
    }

    private function sessionAnchor(ChatConversation $conversation)
    {
        return $conversation->last_message_at
            ?? $conversation->visitor_last_seen_at
            ?? $conversation->created_at;
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
