import { useCollection } from '@/hooks/use-collection';
import { useAllMemberships } from '@/hooks/use-collection-group';
import { countByStatus } from '@/lib/user-filters';
import type { UserProfile } from '@/types';

// Active / pending / deactivated users, live (super admins only; pass false
// to skip). Same rules as the All users filter, so the numbers match it.
export function useUserStatusCounts(enabled: boolean) {
    const users = useCollection<UserProfile>(enabled ? 'users' : null);
    const admins = useCollection<{ id: string }>(enabled ? 'admins' : null);
    const memberships = useAllMemberships(enabled);

    const loading = users.loading || admins.loading || memberships.loading;
    const error = users.error ?? admins.error ?? memberships.error;
    const classCountByUser = new Map<string, number>();

    for (const membership of memberships.data) {
        classCountByUser.set(
            membership.userId,
            (classCountByUser.get(membership.userId) ?? 0) + 1,
        );
    }

    return {
        counts: loading
            ? null
            : countByStatus(
                  users.data,
                  classCountByUser,
                  new Set(admins.data.map((admin) => admin.id)),
              ),
        error,
    };
}
