import { useDocuments } from '@/hooks/use-documents';
import { formatRelativeTime } from '@/lib/dates';
import { notificationText } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import type { AppNotification, ClassGroup, UserProfile } from '@/types';

// Class changes ("added you to…", "changed your role…"), newest first.
export function NotificationList({
    notifications,
}: {
    notifications: AppNotification[];
}) {
    const classes = useDocuments<ClassGroup>([
        ...new Set(notifications.map((item) => `classes/${item.classId}`)),
    ]);
    const actors = useDocuments<UserProfile>([
        ...new Set(notifications.map((item) => `users/${item.actorId}`)),
    ]);
    const classById = new Map(classes.data.map((item) => [item.id, item]));
    const actorById = new Map(actors.data.map((item) => [item.id, item]));

    return (
        <ul className="grid gap-1">
            {notifications.map((notification) => {
                const actor = actorById.get(notification.actorId);

                return (
                    <li
                        key={notification.id}
                        className={cn(
                            'grid gap-0.5 rounded-md px-2 py-1.5 text-sm',
                            !notification.read && 'bg-muted',
                        )}
                    >
                        <span
                            className={cn(!notification.read && 'font-medium')}
                        >
                            {notificationText(
                                notification,
                                classById.get(notification.classId)?.name ??
                                    'a class',
                                actor
                                    ? `${actor.firstName} ${actor.lastName}`
                                    : 'Someone',
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(
                                notification.createdAt.toDate(),
                            )}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
