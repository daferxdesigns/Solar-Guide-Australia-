import { ImagePlus, MessageCircle, Paperclip, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

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

interface ChatConversation {
    id: number;
    visitor_name?: string | null;
    visitor_email?: string | null;
    visitor_phone?: string | null;
    status: 'open' | 'closed' | 'completed';
    visitor_typing?: boolean;
    admin_typing?: boolean;
    expires_at?: string | null;
}

const storageKey = 'solar-guide-chat-conversation-id';

export function LocalLiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [conversation, setConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const lastTypingSentRef = useRef(0);
    const attachmentInputRef = useRef<HTMLInputElement | null>(null);
    const screenshotInputRef = useRef<HTMLInputElement | null>(null);

    const latestVisitorMessage = [...messages].reverse().find((item) => item.sender_type === 'visitor');
    const isReplyDisabled = conversation?.status !== 'open';

    useEffect(() => {
        const savedId = window.localStorage.getItem(storageKey);

        if (!savedId) {
            return;
        }

        void fetchMessages(savedId);
    }, []);

    useEffect(() => {
        if (!conversation?.id) {
            return;
        }

        const interval = window.setInterval(() => {
            void fetchMessages(String(conversation.id), false);
        }, 2000);

        return () => window.clearInterval(interval);
    }, [conversation?.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, conversation?.admin_typing]);

    const fetchMessages = async (conversationId: string, showErrors = true) => {
        try {
            const response = await fetch(`/chat/messages?conversation_id=${conversationId}`, {
                headers: { Accept: 'application/json' },
            });

            if (response.status === 404 || response.status === 410 || response.status === 422) {
                window.localStorage.removeItem(storageKey);
                setConversation(null);
                setMessages([]);
                setHasStarted(false);
                setMessage('');
                return;
            }

            if (!response.ok) {
                throw new Error('Unable to load chat messages.');
            }

            const data = await response.json();

            setConversation(data.conversation);
            setMessages(data.messages);
            setHasStarted(true);
            setName(data.conversation.visitor_name || '');
            setEmail(data.conversation.visitor_email || '');
            setPhone(data.conversation.visitor_phone || '');
        } catch (caught) {
            if (showErrors) {
                setError(caught instanceof Error ? caught.message : 'Unable to load chat messages.');
            }
        }
    };

    const sendTyping = async () => {
        if (!conversation?.id || message.trim() === '') {
            return;
        }

        const now = Date.now();

        if (now - lastTypingSentRef.current < 2500) {
            return;
        }

        lastTypingSentRef.current = now;

        await fetch('/chat/typing', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({
                conversation_id: conversation.id,
            }),
        }).catch(() => null);
    };

    const startChat = async () => {
        setError(null);
        setIsStarting(true);

        try {
            const response = await fetch('/chat/start', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                }),
            });

            if (!response.ok) {
                const responseData = await response.json().catch(() => null);
                const validationErrors = responseData?.errors ? Object.values(responseData.errors).flat() : [];

                if (response.status === 419) {
                    throw new Error('Your session expired. Please refresh and try again.');
                }

                if (response.status === 422 && validationErrors.length > 0) {
                    throw new Error(String(validationErrors[0]));
                }

                throw new Error(responseData?.message || 'We could not start your support session just yet.');
            }

            const data = await response.json();

            setConversation(data.conversation);
            setMessages(data.messages);
            setHasStarted(true);
            setName(data.conversation.visitor_name || '');
            setEmail(data.conversation.visitor_email || '');
            setPhone(data.conversation.visitor_phone || '');
            window.localStorage.setItem(storageKey, String(data.conversation.id));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'We could not start your support session just yet.');
        } finally {
            setIsStarting(false);
        }
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (!conversation?.id) {
            setError('Please start a support session first.');
            return;
        }

        if (!message.trim() && !attachment) {
            setError('Please enter a message or attach a file.');
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('conversation_id', String(conversation.id));
            formData.append('message', message);

            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await fetch('/chat/messages', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: formData,
            });

            if (!response.ok) {
                const responseData = await response.json().catch(() => null);
                const validationErrors = responseData?.errors ? Object.values(responseData.errors).flat() : [];

                if (response.status === 419) {
                    throw new Error('Your session expired. Please try sending that again.');
                }

                if (response.status === 422 && validationErrors.length > 0) {
                    throw new Error(String(validationErrors[0]));
                }

                if (response.status === 423) {
                    throw new Error(responseData?.message || 'This chat is not active right now.');
                }

                throw new Error(responseData?.message || 'We could not send your message just yet. Please try again.');
            }

            const data = await response.json();

            setConversation(data.conversation);
            setMessages(data.messages);
            setHasStarted(true);
            setName(data.conversation.visitor_name || '');
            setEmail(data.conversation.visitor_email || '');
            setPhone(data.conversation.visitor_phone || '');
            setMessage('');
            setAttachment(null);

            if (attachmentInputRef.current) {
                attachmentInputRef.current.value = '';
            }

            if (screenshotInputRef.current) {
                screenshotInputRef.current.value = '';
            }

            window.localStorage.setItem(storageKey, String(data.conversation.id));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'We could not send your message just yet. Please try again.');
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

    return (
        <div className="fixed bottom-5 right-5 z-[120]">
            {isOpen && (
                <div className="mb-4 w-[min(27rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-[#123524]/10 bg-white shadow-[0_24px_80px_rgba(16,36,28,0.22)]">
                    <div className="relative overflow-hidden bg-linear-to-br from-[#0f3024] via-[#14573e] to-[#1d7f5c] px-5 py-5 text-white">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#f0a23b]/20 blur-2xl" />
                            <div className="absolute left-8 top-8 h-16 w-16 rounded-full border border-white/12" />
                        </div>

                        <div className="relative pr-10">
                            <div className="text-[11px] font-semibold tracking-[0.24em] text-[#d5efc9] uppercase">
                                Solar Link Advisory Desk
                            </div>
                            <div className="mt-1 text-lg font-semibold">Priority solar support</div>
                            <div className="mt-1 max-w-[18rem] text-xs leading-5 text-white/75">
                                Direct access to our support team for installation guidance, monitoring issues, and product troubleshooting.
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {!hasStarted && !conversation ? (
                        <div className="space-y-5 bg-linear-to-b from-[#f7f8f2] to-white px-5 py-5">
                            <div className="rounded-[1.5rem] border border-[#dfe8dd] bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-[#eef6ec] p-2 text-[#14573e]">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            Start a guided support session
                                        </div>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Share your details first so our team can identify your job, follow up properly, and keep your support thread connected for the next 5 hours of activity.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Full name"
                                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                                <input
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    type="email"
                                    placeholder="Email address"
                                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                                <input
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="Contact number"
                                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => void startChat()}
                                disabled={isStarting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4d36]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {isStarting ? 'Starting support...' : 'Start live support'}
                            </button>

                            {error && <div className="text-sm text-red-600">{error}</div>}
                        </div>
                    ) : (
                        <>
                            <div className="max-h-80 space-y-3 overflow-y-auto bg-linear-to-b from-[#f5f6ef] to-white px-4 py-4">
                                <div className="rounded-[1.2rem] border border-slate-200/80 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm">
                                    Connected as <span className="font-semibold text-slate-700">{name}</span>.
                                    {conversation?.expires_at &&
                                        ` This session stays active until ${new Date(conversation.expires_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })} if no new activity comes through.`}
                                </div>

                                {conversation?.status !== 'open' && (
                                    <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 shadow-sm">
                                        {conversation?.status === 'completed'
                                            ? 'This support thread is marked completed. Please wait for our team to reopen it if more help is needed.'
                                            : 'This support thread is currently closed. Our team can reopen it if more help is needed.'}
                                    </div>
                                )}

                                {messages.length === 0 && (
                                    <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600 shadow-sm">
                                        Welcome to Solar Link Australia. Share your question and our team will respond here with clear next steps, product guidance, or troubleshooting support.
                                    </div>
                                )}

                                {messages.map((chatMessage) => {
                                    const isVisitor = chatMessage.sender_type === 'visitor';
                                    const isLatestVisitorMessage = latestVisitorMessage?.id === chatMessage.id;

                                    return (
                                        <div key={chatMessage.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                                    isVisitor ? 'bg-[#123524] text-white' : 'bg-white text-slate-700'
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
                                                                    className="max-h-56 rounded-xl border border-white/10 object-contain"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={chatMessage.attachment_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                                                                    isVisitor
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

                                                <div className={`mt-2 text-[11px] ${isVisitor ? 'text-white/62' : 'text-slate-400'}`}>
                                                    {chatMessage.created_at
                                                        ? new Date(chatMessage.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : ''}
                                                </div>

                                                {isVisitor && isLatestVisitorMessage && chatMessage.read_at && (
                                                    <div className="mt-1 text-[11px] text-white/72">Seen by support</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {conversation?.admin_typing && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl bg-white px-4 py-3 text-xs font-medium text-slate-500 shadow-sm">
                                            Support team is typing...
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>

                            <form onSubmit={submit} className="space-y-3 border-t border-slate-100 p-4">
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
                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold text-slate-800">{attachment.name}</div>
                                            <div className="mt-1">{(attachment.size / (1024 * 1024)).toFixed(2)} MB attached</div>
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
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        Messaging is paused for this thread right now.
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                value={message}
                                                onChange={(event) => {
                                                    setMessage(event.target.value);
                                                    void sendTyping();
                                                }}
                                                placeholder="Tell us what system, inverter, or issue you need help with..."
                                                className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => attachmentInputRef.current?.click()}
                                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                                                title="Attach file"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => screenshotInputRef.current?.click()}
                                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                                                title="Attach screenshot"
                                            >
                                                <ImagePlus className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isSending}
                                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0a23b] text-[#17331f] transition hover:bg-[#f8bb62] disabled:opacity-60"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="text-[11px] text-slate-400">
                                            Attach a file up to 20 MB, or use the screenshot button for an image.
                                        </div>
                                    </>
                                )}

                                {error && <div className="text-sm text-red-600">{error}</div>}
                            </form>
                        </>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#123524] to-[#1c6a4b] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(18,53,36,0.28)] transition hover:-translate-y-0.5 hover:from-[#16412d] hover:to-[#227a56]"
            >
                <MessageCircle className="h-5 w-5" />
                Live support
            </button>
        </div>
    );
}