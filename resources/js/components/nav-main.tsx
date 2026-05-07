import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const isActive = (url: string) => {
        if (url === '/dashboard') {
            return page.url === url;
        }

        return page.url === url || page.url.startsWith(`${url}/`);
    };

    useEffect(() => {
        setOpenGroups((current) => {
            const next = { ...current };

            items.forEach((item) => {
                if (!item.items?.length) {
                    return;
                }

                const hasActiveChild = item.items.some((subItem) => isActive(subItem.url));
                if (hasActiveChild && next[item.title] !== true) {
                    next[item.title] = true;
                }
            });

            return next;
        });
    }, [items, page.url]);

    const toggleGroup = (title: string) => {
        setOpenGroups((current) => ({
            ...current,
            [title]: !current[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.items && item.items.length > 0 ? (
                            <>
                                <SidebarMenuButton
                                    type="button"
                                    isActive={isActive(item.url) || item.items.some((subItem) => isActive(subItem.url))}
                                    onClick={() => toggleGroup(item.title)}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                                <SidebarMenuAction
                                    type="button"
                                    showOnHover
                                    onClick={() => toggleGroup(item.title)}
                                    className={`transition ${openGroups[item.title] ? 'rotate-180' : ''}`}
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </SidebarMenuAction>
                                {openGroups[item.title] && (
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={`${item.title}-${subItem.title}`}>
                                                <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                                    <Link href={subItem.url} prefetch>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </>
                        ) : (
                            <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
