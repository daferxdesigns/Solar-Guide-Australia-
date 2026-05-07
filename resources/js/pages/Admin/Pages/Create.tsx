import { type BreadcrumbItem } from '@/types';
import PageForm from './PageForm';

export default function Create({ page }: { page: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Add Page', href: '/admin/pages/create' },
    ];

    return <PageForm mode="create" page={page} breadcrumbs={breadcrumbs} />;
}
