import type { UserStatus } from '@/lib/account-status';
import { getUserStatus } from '@/lib/account-status';
import type { UserProfile } from '@/types';

export type UserFilters = { search: string; status: UserStatus | 'all' };

type Named = Pick<UserProfile, 'firstName' | 'lastName'>;

// Firestore has no LIKE / full-text search, so tables load everything (class
// size) and search by first or last name in memory.
export function matchesName(user: Named, search: string) {
    const query = search.trim().toLowerCase();

    if (query === '') {
        return true;
    }

    const first = user.firstName.toLowerCase();
    const last = user.lastName.toLowerCase();

    return (
        first.includes(query) ||
        last.includes(query) ||
        `${first} ${last}`.includes(query)
    );
}

export function compareByName(a: Named, b: Named) {
    return (
        a.lastName.localeCompare(b.lastName) ||
        a.firstName.localeCompare(b.firstName)
    );
}

// Same statuses as the users table filter, so dashboard numbers match it.
export function countByStatus(
    users: UserProfile[],
    classCountByUser: Map<string, number>,
    superAdminIds: Set<string>,
) {
    const counts: Record<UserStatus, number> = {
        active: 0,
        pending: 0,
        deactivated: 0,
    };

    for (const user of users) {
        counts[
            getUserStatus(
                user,
                classCountByUser.get(user.id) ?? 0,
                superAdminIds.has(user.id),
            )
        ] += 1;
    }

    return counts;
}

// classCountByUser: number of class memberships per uid.
export function filterUsers(
    users: UserProfile[],
    classCountByUser: Map<string, number>,
    superAdminIds: Set<string>,
    filters: UserFilters,
) {
    return users
        .filter(
            (user) =>
                filters.status === 'all' ||
                getUserStatus(
                    user,
                    classCountByUser.get(user.id) ?? 0,
                    superAdminIds.has(user.id),
                ) === filters.status,
        )
        .filter((user) => matchesName(user, filters.search))
        .sort(compareByName);
}
