import type { UserStatus } from '@/lib/account-status';
import { getUserStatus } from '@/lib/account-status';
import type { UserProfile } from '@/types';

export type UserFilters = { search: string; status: UserStatus | 'all' };

// Firestore has no LIKE / full-text search, so the users table loads the
// whole collection and searches by first or last name in memory.
// classCountByUser: number of class memberships per uid.
export function filterUsers(
    users: UserProfile[],
    classCountByUser: Map<string, number>,
    filters: UserFilters,
) {
    const query = filters.search.trim().toLowerCase();

    return users
        .filter(
            (user) =>
                filters.status === 'all' ||
                getUserStatus(user, classCountByUser.get(user.id) ?? 0) ===
                    filters.status,
        )
        .filter((user) => {
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
        })
        .sort(
            (a, b) =>
                a.lastName.localeCompare(b.lastName) ||
                a.firstName.localeCompare(b.firstName),
        );
}
