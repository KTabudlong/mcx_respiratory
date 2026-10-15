import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { UserFilters } from '@/lib/user-filters';
import { filterUsers, matchesName } from '@/lib/user-filters';
import type { UserProfile } from '@/types';

function makeUser(overrides: Partial<UserProfile>): UserProfile {
    return {
        id: 'u',
        firstName: 'First',
        lastName: 'Last',
        email: 'x@student.ccc.edu',
        createdBy: null,
        createdInClassId: null,
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
        ...overrides,
    };
}

const users = [
    makeUser({ id: 'a', firstName: 'Maria', lastName: 'Santos' }),
    makeUser({ id: 'b', firstName: 'John', lastName: 'Abbott' }),
    makeUser({
        id: 'c',
        firstName: 'Ana',
        lastName: 'Mariano',
        deletedAt: {} as Timestamp,
    }),
    makeUser({ id: 'd', firstName: 'Kynt', lastName: 'Zeta' }),
];

// b is in no class → pending; d is in no class but is a super admin.
const classCounts = new Map([
    ['a', 1],
    ['c', 2],
]);
const superAdminIds = new Set(['d']);

const ids = (filters: UserFilters) =>
    filterUsers(users, classCounts, superAdminIds, filters).map(
        (user) => user.id,
    );

describe('matchesName', () => {
    it('matches first, last or "first last", case-insensitively', () => {
        expect(matchesName(users[0], 'SANT')).toBe(true);
        expect(matchesName(users[1], 'john abb')).toBe(true);
        expect(matchesName(users[1], 'abbott john')).toBe(false);
        expect(matchesName(users[1], '   ')).toBe(true);
    });
});

describe('filterUsers', () => {
    it('sorts by last name, then first name', () => {
        expect(ids({ search: '', status: 'all' })).toEqual([
            'b',
            'c',
            'a',
            'd',
        ]);
    });

    it('searches names', () => {
        expect(ids({ search: 'MARI', status: 'all' })).toEqual(['c', 'a']);
    });

    it('filters by status, counting super admins as active', () => {
        expect(ids({ search: '', status: 'pending' })).toEqual(['b']);
        expect(ids({ search: '', status: 'deactivated' })).toEqual(['c']);
        expect(ids({ search: '', status: 'active' })).toEqual(['a', 'd']);
    });
});
