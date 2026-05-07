import AdminSettingsLayout from '@/components/admin-settings-layout';

export default function DeletedContent({
    deletedPosts,
    deletedComments,
    deletedChats,
}: {
    deletedPosts: Array<{ id: number; title: string; slug: string; deleted_at?: string | null }>;
    deletedComments: Array<{ id: number; author_name: string; author_email: string; content: string; deleted_at?: string | null }>;
    deletedChats: Array<{ id: number; visitor_name?: string | null; visitor_email?: string | null; status: string; deleted_at?: string | null }>;
}) {
    return (
        <AdminSettingsLayout
            title="Deleted Content"
            description="Review items that were removed from the public website without permanently wiping them from the database."
            activeHref="/admin/settings/deleted-content"
        >
            <div className="grid gap-6 xl:grid-cols-3">
                <DeletedCard
                    title="Deleted posts"
                    rows={deletedPosts.map((post) => ({
                        heading: post.title,
                        body: `/guides/${post.slug}`,
                        meta: post.deleted_at,
                    }))}
                />
                <DeletedCard
                    title="Deleted comments"
                    rows={deletedComments.map((comment) => ({
                        heading: comment.author_name,
                        body: comment.content,
                        meta: comment.deleted_at,
                    }))}
                />
                <DeletedCard
                    title="Deleted chats"
                    rows={deletedChats.map((chat) => ({
                        heading: chat.visitor_name || 'Website visitor',
                        body: chat.visitor_email || chat.status,
                        meta: chat.deleted_at,
                    }))}
                />
            </div>
        </AdminSettingsLayout>
    );
}

function DeletedCard({
    title,
    rows,
}: {
    title: string;
    rows: Array<{ heading: string; body: string; meta?: string | null }>;
}) {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <div className="mt-4 space-y-3">
                {rows.length > 0 ? (
                    rows.map((row, index) => (
                        <div key={`${title}-${index}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="font-semibold text-slate-900">{row.heading}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">{row.body}</div>
                            <div className="mt-2 text-xs text-slate-400">
                                {row.meta ? new Date(row.meta).toLocaleString() : 'Deleted'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                        Nothing deleted here yet.
                    </div>
                )}
            </div>
        </section>
    );
}
