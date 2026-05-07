import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ImagePlus, Paperclip, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chats', href: '/admin/chats' },
];

interface ConversationSummary {
    id: number;
    visitor_name?: string | null;
    visitor_email?: string | null;
    visitor_phone?: string | null;
    status: 'open' | 'closed' | 'completed';
    unread_count: number;
    is_new?: boolean;
    last_message?: string | null;
    last_message_at?: string | null;
    visitor_typing?: boolean;
}

interface ChatMessage {
    id: number;
    sender_type: 'visitor' | 'admin' | 'system';
    body?: string | null;
    created_at?: string | null;
    read_at?: string | null;
    attachment_url?: string | null;
    attachment_name?: string | null;
    attachment_mime?: string | null;
    attachment_size?: number | null;
    attachment_is_image?: boolean;
}

interface SelectedConversation extends ConversationSummary {
    visitor_last_seen_at?: string | null;
    admin_last_seen_at?: string | null;
    admin_typing?: boolean;
    messages: ChatMessage[];
}

export default function Index({
    conversations: initialConversations,
    selectedConversation: initialSelectedConversation,
}: {
    conversations: ConversationSummary[];
    selectedConversation: SelectedConversation | null;
}) {
    const { flash } = usePage<SharedData>().props;
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(initialSelectedConversation);
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const lastTypingSentRef = useRef(0);
    const attachmentInputRef = useRef<HTMLInputElement | null>(null);
    const screenshotInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setConversations(initialConversations);
    }, [initialConversations]);

    useEffect(() => {
        setSelectedConversation(initialSelectedConversation);
    }, [initialSelectedConversation]);

    useEffect(() => {
        if (!selectedConversation?.id) {
            return;
        }

        const interval = window.setInterval(() => {
            void refreshData(selectedConversation.id);
        }, 2000);

        return () => window.clearInterval(interval);
    }, [selectedConversation?.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages, selectedConversation?.visitor_typing]);

    const refreshData = async (conversationId?: number) => {
        const targetId = conversationId ?? selectedConversation?.id ?? '';
        const response = await fetch(`/admin/chats/data?conversation=${targetId}`, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        setConversations(data.conversations);
        setSelectedConversation(data.selectedConversation);
    };

    const sendTyping = async () => {
        if (!selectedConversation?.id || message.trim() === '') {
            return;
        }

        const now = Date.now();
        if (now - lastTypingSentRef.current < 2500) {
            return;
        }

        lastTypingSentRef.current = now;

        await fetch(`/admin/chats/${selectedConversation.id}/typing`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            },
        }).catch(() => null);
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (!selectedConversation || (message.trim() === '' && !attachment)) {
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('message', message);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await fetch(`/admin/chats/${selectedConversation.id}/reply-json`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const validationErrors = data?.errors ? Object.values(data.errors).flat() : [];
                throw new Error(validationErrors[0] ? String(validationErrors[0]) : 'Unable to send reply right now.');
            }

            const data = await response.json();
            setConversations(data.conversations);
            setSelectedConversation(data.selectedConversation);
            setMessage('');
            setAttachment(null);
            if (attachmentInputRef.current) {
                attachmentInputRef.current.value = '';
            }
            if (screenshotInputRef.current) {
                screenshotInputRef.current.value = '';
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Unable to send reply right now.');
        } finally {
            setIsSending(false);
        }
    };

    const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setAttachment(file);
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
        if (screenshotInputRef.current) {
            screenshotInputRef.current.value = '';
        }
    };

    const latestAdminMessage = [...(selectedConversation?.messages ?? [])].reverse().find((item) => item.sender_type === 'admin');
    const isReplyDisabled = selectedConversation?.status !== 'open';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Live Chats" />

            <div className="space-y-6 px-4 py-4 xl:px-6">
                <section className="rounded-[2rem] border border-emerald-100 bg-linear-to-br from-[#102f24] via-[#14573e] to-[#f0a23b] p-6 text-white shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.22em] text-emerald-100 uppercase">Live support desk</p>
                    <h1 className="mt-2 text-3xl font-semibold">Website chats</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/82">
                        Watch incoming chats, reply without reloading the page, and track typing and seen states as the conversation unfolds.
                    </p>
                </section>

                {flash?.success && (
                    <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900">
                        {flash.success}
                    </section>
                )}

                <section className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <div className="text-sm font-semibold text-slate-900">Conversations</div>
                        </div>
                        <div className="max-h-[40rem] overflow-y-auto">
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() => void refreshData(conversation.id)}
                                    className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                                        selectedConversation?.id === conversation.id ? 'bg-emerald-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-semibold text-slate-900">{conversation.visitor_name || 'Website visitor'}</div>
                                        <div className="flex items-center gap-2">
                                            {conversation.is_new && (
                                                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">
                                                    New
                                                </span>
                                            )}
                                            {conversation.unread_count > 0 && (
                                                <span className="rounded-full bg-[#f0a23b] px-2 py-1 text-xs font-semibold text-[#17331f]">
                                                    {conversation.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-1 truncate text-sm text-slate-500">
                                        {conversation.visitor_typing ? 'Typing...' : conversation.last_message || 'No messages yet'}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                                        <span>{conversation.visitor_phone || conversation.visitor_email || 'No contact details'}</span>
                                        <span>{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : ''}</span>
                                    </div>
                                </button>
                            ))}
                            {conversations.length === 0 && (
                                <div className="px-5 py-12 text-center text-sm text-slate-500">No chat conversations yet.</div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        {selectedConversation ? (
                            <>
                                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">{selectedConversation.visitor_name || 'Website visitor'}</h2>
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                            <span>{selectedConversation.visitor_email || 'No email provided'}</span>
                                            <span>{selectedConversation.visitor_phone || 'No contact number'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConversation.status !== 'open' && (
                                            <Link
                                                as="button"
                                                method="patch"
                                                href={`/admin/chats/${selectedConversation.id}/open`}
                                                preserveScroll
                                                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                Mark open
                                            </Link>
                                        )}
                                        {selectedConversation.status !== 'closed' && (
                                            <Link
                                                as="button"
                                                method="patch"
                                                href={`/admin/chats/${selectedConversation.id}/close`}
                                                preserveScroll
                                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Close
                                            </Link>
                                        )}
                                        {selectedConversation.status !== 'completed' && (
                                            <Link
                                                as="button"
                                                method="patch"
                                                href={`/admin/chats/${selectedConversation.id}/complete`}
                                                preserveScroll
                                                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
                                            >
                                                Complete
                                            </Link>
                                        )}
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/admin/chats/${selectedConversation.id}`}
                                            preserveScroll
                                            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </Link>
                                    </div>
                                </div>

                                <div className="max-h-[30rem] space-y-3 overflow-y-auto bg-[#f5f6ef] px-6 py-6">
                                    {selectedConversation.messages.map((chatMessage) => {
                                        const isAdmin = chatMessage.sender_type === 'admin';
                                        const isLatestAdminMessage = latestAdminMessage?.id === chatMessage.id;

                                        return (
                                            <div key={chatMessage.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                                        isAdmin ? 'bg-[#123524] text-white' : 'bg-white text-slate-700'
                                                    }`}
                                                >
                                                    {chatMessage.body && <div>{chatMessage.body}</div>}
                                                    {chatMessage.attachment_url && (
                                                        <div className={chatMessage.body ? 'mt-3' : ''}>
                                                            {chatMessage.attachment_is_image ? (
                                                                <a href={chatMessage.attachment_url} target="_blank" rel="noreferrer">
                                                                    <img
                                                                        src={chatMessage.attachment_url}
                                                                        alt={chatMessage.attachment_name || 'Chat attachment'}
                                                                        className="max-h-72 rounded-xl border border-white/10 object-contain"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href={chatMessage.attachment_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                                                                        isAdmin
                                                                            ? 'bg-white/12 text-white hover:bg-white/18'
                                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                                >
                                                                    <Paperclip className="h-3.5 w-3.5" />
                                                                    {chatMessage.attachment_name || 'Download attachment'}
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`mt-2 text-[11px] ${isAdmin ? 'text-white/60' : 'text-slate-400'}`}>
                                                        {chatMessage.created_at ? new Date(chatMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </div>
                                                    {isAdmin && isLatestAdminMessage && chatMessage.read_at && (
                                                        <div className="mt-1 text-[11px] text-white/72">Seen by visitor</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {selectedConversation.visitor_typing && (
                                        <div className="flex justify-start">
                                            <div className="rounded-2xl bg-white px-4 py-3 text-xs font-medium text-slate-500 shadow-sm">
                                                Visitor is typing...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>

                                <form onSubmit={submit} className="border-t border-slate-200 p-5">
                                    <input
                                        ref={attachmentInputRef}
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                                        onChange={handleAttachmentChange}
                                        className="hidden"
                                    />
                                    <input
                                        ref={screenshotInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAttachmentChange}
                                        className="hidden"
                                    />
                                    {attachment && (
                                        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold text-slate-800">
                                                    {attachment.name}
                                                </div>
                                                <div className="mt-1">
                                                    {(attachment.size / (1024 * 1024)).toFixed(2)} MB attached
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeAttachment}
                                                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    {isReplyDisabled ? (
                                        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                                            {selectedConversation.status === 'completed'
                                                ? 'This chat is marked completed. Reopen it to send another message.'
                                                : 'This chat is currently closed. Reopen it to continue replying.'}
                                        </div>
                                    ) : (
                                        <>
                                            <textarea
                                                value={message}
                                                onChange={(event) => {
                                                    setMessage(event.target.value);
                                                    void sendTyping();
                                                }}
                                                rows={4}
                                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                                placeholder="Write a reply..."
                                            />
                                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                                            <div className="mt-3 flex items-center justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => attachmentInputRef.current?.click()}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                                                            title="Attach file"
                                                        >
                                                            <Paperclip className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => screenshotInputRef.current?.click()}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                                                            title="Attach screenshot"
                                                        >
                                                            <ImagePlus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400">Connected and updating automatically.</div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSending}
                                                    className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36] disabled:opacity-60"
                                                >
                                                    {isSending ? 'Sending...' : 'Send reply'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="px-6 py-24 text-center text-sm text-slate-500">Select a chat to start replying.</div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
