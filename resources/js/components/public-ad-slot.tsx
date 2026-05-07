declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

import { useEffect } from 'react';

export function PublicAdSlot({
    label,
    slot,
    publisherId,
    enabled,
    displayAds,
    className = '',
}: {
    label: string;
    slot?: string | null;
    publisherId?: string | null;
    enabled: boolean;
    displayAds: boolean;
    className?: string;
}) {
    useEffect(() => {
        if (!displayAds || !enabled || !slot || !publisherId || typeof window === 'undefined') {
            return;
        }

        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch {
            // Ignore AdSense push failures so the page stays usable during setup.
        }
    }, [displayAds, enabled, slot, publisherId]);

    if (!displayAds) {
        return null;
    }

    return (
        <section className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm ${className}`}>
            <div className="border-b border-slate-100 px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">{label}</div>
            <div className="p-5">
                {enabled && publisherId && slot ? (
                    <ins
                        className="adsbygoogle block min-h-[120px] w-full overflow-hidden rounded-2xl bg-slate-50"
                        style={{ display: 'block' }}
                        data-ad-client={publisherId}
                        data-ad-slot={slot}
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    />
                ) : (
                    <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center text-sm text-slate-500">
                        Ad space reserved here. Add your AdSense publisher and slot ID in settings when you are ready to go live.
                    </div>
                )}
            </div>
        </section>
    );
}
