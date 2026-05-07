import { Facebook, Link2, Mail, Twitter } from 'lucide-react';
import { useState } from 'react';

export function PublicShareBar({
    title,
    url,
}: {
    title: string;
    url: string;
}) {
    const [copied, setCopied] = useState(false);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Share this guide</div>
            <div className="mt-4 flex flex-wrap gap-2">
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <Facebook className="h-4 w-4" />
                    Facebook
                </a>
                <a
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <Twitter className="h-4 w-4" />
                    Twitter
                </a>
                <a
                    href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <Mail className="h-4 w-4" />
                    Email
                </a>
                <button
                    type="button"
                    onClick={() => {
                        void navigator.clipboard.writeText(url);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1800);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <Link2 className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy link'}
                </button>
            </div>
        </div>
    );
}
