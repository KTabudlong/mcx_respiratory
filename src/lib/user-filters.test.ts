import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { filterUsers } from '@/lib/user-filters';
import type { UserProfile } from '@/types';

function makeUser(overrides: Partial<UserProfile>): UserProfile {
    return {
        id: 'u',
        firstName: 'First',
        lastName: 'Last',
        email: 'x@student.ccc.edu',
        roleIds: [],
        permissions: [],
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
];

// b is in no class → pending.
const classCounts = new Map([
    ['a', 1],
    ['c', 2],
]);

const ids = (list: UserProfile[]) => list.map((user) => user.id);

describe('filterUsers', () => {
    it('sorts by last name, then first name', () => {
        expect(
            ids(filterUsers(users, classCounts, { search: '', status: 'all' })),
        ).toEqual(['b', 'c', 'a']);
    });

    it('searches first and last names, case-insensitively', () => {
        expect(
            ids(
                filterUsers(users, classCounts, {
                    search: 'MARI',
                    status: 'all',
                }),
            ),
        ).toEqual(['c', 'a']);
        expect(
            ids(
                filterUsers(users, classCounts, {
                    search: 'john abb',
                    status: 'all',
                }),
            ),
        ).toEqual(['b']);
    });

    it('filters by status', () => {
        expect(
            ids(
                filterUsers(users, classCounts, {
                    search: '',
                    status: 'pending',
                }),
            ),
        ).toEqual(['b']);
        expect(
            ids(
                filterUsers(users, classCounts, {
                    search: '',
                    status: 'deactivated',
                }),
            ),
        ).toEqual(['c']);
        expect(
            ids(
                filterUsers(users, classCounts, {
                    search: '',
                    status: 'active',
                }),
            ),
        ).toEqual(['a']);
    });
});
