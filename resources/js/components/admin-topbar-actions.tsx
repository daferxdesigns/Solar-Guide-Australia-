import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronsUpDown } from 'lucide-react';

export function AdminTopbarActions() {
    const { auth, adminNotifications = [] } = usePage<SharedData>().props;

    return (
        <div className="flex items-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <Bell className="h-4 w-4" />
                        {adminNotifications.length > 0 && (
                            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                                {adminNotifications.length}
                            </span>
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 max-w-[90vw] rounded-xl">
                    <DropdownMenuLabel>Website content activity</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminNotifications.length > 0 ? (
                        adminNotifications.map((item) => (
                            <DropdownMenuItem key={item.id} asChild>
                                <Link href={item.href} className="block w-full rounded-lg px-2 py-2">
                                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                                    <div className="mt-1 text-xs text-slate-500">{item.description}</div>
                                    {item.created_at && <div className="mt-1 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</div>}
                                </Link>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">No website content activity yet.</div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex min-w-[220px] items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-slate-800 shadow-sm transition hover:bg-slate-50"
                    >
                        <UserInfo user={auth.user} />
                        <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-500" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-xl">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
