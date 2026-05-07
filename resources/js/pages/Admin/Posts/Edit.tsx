import { type BreadcrumbItem } from '@/types';
import PostForm from './PostForm';

export default function Edit(props: {
    categories: Array<{ id: number; name: string; slug: string }>;
    post: {
        id: number;
        guide_category_id: number | null;
        title: string;
        slug: string;
        status: 'draft' | 'published';
        is_featured: boolean;
        excerpt: string;
        seo_title: string;
        seo_description: string;
        seo_keywords: string;
        canonical_url: string;
        content: string;
        featured_image_url: string | null;
        featured_image_alt: string;
        published_at: string;
        analytics: {
            total_visits: number;
            unique_visitors: number;
            device_types: Array<{ label: string; visits: number }>;
            browsers: Array<{ label: string; visits: number }>;
            operating_systems: Array<{ label: string; visits: number }>;
            referrers: Array<{ label: string; visits: number }>;
        };
    };
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/admin/posts' },
        { title: props.post.title, href: `/admin/posts/${props.post.id}/edit` },
    ];

    return (
        <PostForm
            pageTitle="Edit Post"
            heroTitle={`Edit: ${props.post.title}`}
            submitLabel="Save changes"
            breadcrumbs={breadcrumbs}
            categories={props.categories}
            post={props.post}
            submitUrl={`/admin/posts/${props.post.id}`}
            method="put"
        />
    );
}
