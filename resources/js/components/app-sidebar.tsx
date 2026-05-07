import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BrainCircuit,
    FileStack,
    Inbox,
    LayoutGrid,
    LineChart,
    Menu,
    MessageCircle,
    MessageSquare,
    PencilLine,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Posts',
        url: '/admin/posts',
        icon: PencilLine,
    },
    {
        title: 'Pages',
        url: '/admin/pages',
        icon: FileStack,
        items: [
            { title: 'All Pages', url: '/admin/pages' },
            { title: 'Add Page', url: '/admin/pages/create' },
        ],
    },
    {
        title: 'Categories',
        url: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'Menu',
        url: '/admin/menus',
        icon: Menu,
    },
    {
        title: 'Comments',
        url: '/admin/comments',
        icon: MessageSquare,
    },
    {
        title: 'Analytics',
        url: '/admin/analytics',
        icon: LineChart,
    },
    {
        title: 'Leads',
        url: '/admin/leads',
        icon: Inbox,
    },
    {
        title: 'Chats',
        url: '/admin/chats',
        icon: MessageCircle,
    },
    {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
    },
    {
        title: 'Settings',
        url: '/admin/settings/general',
        icon: Settings,
        items: [
            { title: 'General', url: '/admin/settings/general' },
            { title: 'SEO & Crawling', url: '/admin/settings/seo' },
            { title: 'Google AdSense', url: '/admin/settings/adsense' },
            { title: 'Mail SMTP', url: '/admin/settings/mail' },
            { title: 'Menu Settings', url: '/admin/settings/menus' },
            { title: 'Footer Builder', url: '/admin/settings/footer' },
            { title: 'Captcha', url: '/admin/settings/captcha' },
            { title: 'AI Writer', url: '/admin/settings/ai-writer', icon: BrainCircuit },
            { title: 'Deleted Content', url: '/admin/settings/deleted-content' },
            { title: 'Backups', url: '/admin/settings/backups' },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
