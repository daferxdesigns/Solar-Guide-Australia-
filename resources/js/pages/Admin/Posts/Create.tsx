import { type BreadcrumbItem } from '@/types';
import PostForm from './PostForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/admin/posts' },
    { title: 'Create Post', href: '/admin/posts/create' },
];

export default function Create(props: {
    categories: Array<{ id: number; name: string; slug: string }>;
    aiAccounts: Array<{ id: number; name: string; model: string }>;
    post: {
        id: number | null;
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
        schema_type: string;
        schema_custom_json: string;
        content: string;
        featured_image_url: string | null;
        featured_image_alt: string;
        header_background_mode: 'color' | 'image' | 'none';
        header_background_color: string;
        header_background_image_url: string | null;
        header_background_image_position: string;
        header_background_image_size: 'cover' | 'contain' | 'auto' | '100% 100%';
        header_background_image_repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
        header_overlay_opacity: number;
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
    return (
        <PostForm
            pageTitle="Create Post"
            heroTitle="Create a new guide article"
            submitLabel="Create post"
            breadcrumbs={breadcrumbs}
            categories={props.categories}
            aiAccounts={props.aiAccounts}
            post={props.post}
            submitUrl="/admin/posts"
            method="post"
        />
    );
}
