import { type BreadcrumbItem } from '@/types';
import PageForm from './PageForm';

export default function Edit({
    page,
    isHomepage,
}: {
    page: any;
    isHomepage: boolean;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
        { title: page.title || 'Edit Page', href: `/admin/pages/${page.id}/edit` },
    ];

    return <PageForm mode="edit" page={page} breadcrumbs={breadcrumbs} isHomepage={isHomepage} />;
}
