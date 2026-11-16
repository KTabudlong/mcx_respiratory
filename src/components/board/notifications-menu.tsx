import { Bell } from 'lucide-react';

import { NotificationList } from '@/components/board/notification-list';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { getErrorMessage } from '@/lib/errors';
import { markNotificationsRead } from '@/lib/notifications';

// Bell with an unread count; closing the menu marks everything shown as read.
export function NotificationsMenu() {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const notifications = useNotifications(uid);
    const unreadIds = notifications.data
        .filter((item) => !item.read)
        .map((item) => item.id);

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (!open && uid && unreadIds.length > 0) {
                    void markNotificationsRead(uid, unreadIds);
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={
                        unreadIds.length > 0
                            ? `Notifications, ${unreadIds.length} unread`
                            : 'Notifications'
                    }
                >
                    <Bell aria-hidden />
                    {unreadIds.length > 0 && (
                        <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium text-white">
                            {unreadIds.length > 9 ? '9+' : unreadIds.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="max-h-[70dvh] w-80 overflow-y-auto"
            >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1">
                    {notifications.error ? (
                        <p className="px-2 py-1.5 text-sm text-destructive">
                            {getErrorMessage(notifications.error)}
                        </p>
                    ) : notifications.loading ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                            Loading…
                        </p>
                    ) : notifications.data.length === 0 ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nothing yet. Changes to your classes show up here.
                        </p>
                    ) : (
                        <NotificationList notifications={notifications.data} />
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
