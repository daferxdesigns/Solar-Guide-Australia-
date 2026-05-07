export function trackClickEvent({
    path,
    pageTitle,
    target,
    postSlug,
    categorySlug,
    metadata,
}: {
    path?: string;
    pageTitle?: string;
    target: string;
    postSlug?: string;
    categorySlug?: string;
    metadata?: Record<string, string | number | boolean | null>;
}) {
    void fetch('/analytics/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event_name: 'click',
            path,
            page_title: pageTitle,
            target,
            post_slug: postSlug,
            category_slug: categorySlug,
            metadata,
        }),
        keepalive: true,
        credentials: 'same-origin',
    }).catch(() => undefined);
}
