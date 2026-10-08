import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import {
    canGrantClassRole,
    canGrantRole,
    classPermissionsForRoles,
    hasAdminAccess,
    hasClassPermission,
    hasPermission,
    permissionsForRoles,
} from '@/lib/permissions';
import type { ClassMember, Role, UserProfile } from '@/types';

function makeRole(id: string, permissions: string[]): Role {
    return {
        id,
        name: id,
        color: '#000000',
        permissions,
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
    };
}

const roles = [
    makeRole('student', ['posts.create']),
    makeRole('moderator', ['posts.pin', 'comments.delete_any', 'posts.create']),
    makeRole('admin', ['users.manage', 'roles.manage']),
];

describe('permissionsForRoles', () => {
    it('returns the sorted union of the selected roles', () => {
        expect(permissionsForRoles(['student', 'moderator'], roles)).toEqual([
            'comments.delete_any',
            'posts.create',
            'posts.pin',
        ]);
    });

    it('ignores unknown role IDs and returns nothing for no roles', () => {
        expect(permissionsForRoles(['ghost'], roles)).toEqual([]);
        expect(permissionsForRoles([], roles)).toEqual([]);
    });
});

describe('canGrantRole', () => {
    it('only allows roles whose permissions you already hold', () => {
        const own = ['posts.create', 'posts.pin', 'comments.delete_any'];

        expect(canGrantRole(roles[0], own)).toBe(true);
        expect(canGrantRole(roles[1], own)).toBe(true);
        expect(canGrantRole(roles[2], own)).toBe(false);
    });
});

describe('hasPermission', () => {
    const profile: UserProfile = {
        id: 'u',
        firstName: 'A',
        lastName: 'B',
        email: 'a@ccc.edu',
        roleIds: ['admin'],
        permissions: ['users.manage'],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
    };

    it('checks the stored permissions', () => {
        expect(hasPermission(profile, 'users.manage')).toBe(true);
        expect(hasPermission(profile, 'roles.manage')).toBe(false);
    });

    it('denies everything for deactivated users and missing profiles', () => {
        expect(
            hasPermission(
                { ...profile, deletedAt: {} as Timestamp },
                'users.manage',
            ),
        ).toBe(false);
        expect(hasPermission(null, 'users.manage')).toBe(false);
    });
});

describe('hasAdminAccess', () => {
    const profile: UserProfile = {
        id: 'u',
        firstName: 'A',
        lastName: 'B',
        email: 'a@ccc.edu',
        roleIds: [],
        permissions: [],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
    };

    it('is true when any admin permission is held', () => {
        expect(
            hasAdminAccess({ ...profile, permissions: ['users.view'] }),
        ).toBe(true);
    });

    it('is false for student-only permissions, deactivated users and no profile', () => {
        expect(
            hasAdminAccess({ ...profile, permissions: ['posts.create'] }),
        ).toBe(false);
        expect(
            hasAdminAccess({
                ...profile,
                permissions: ['users.view'],
                deletedAt: {} as Timestamp,
            }),
        ).toBe(false);
        expect(hasAdminAccess(null)).toBe(false);
    });
});

describe('class-scoped permissions', () => {
    const student: UserProfile = {
        id: 'u',
        firstName: 'A',
        lastName: 'B',
        email: 'a@student.ccc.edu',
        roleIds: [],
        permissions: [],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
    };
    const membership: ClassMember = {
        id: 'u',
        classId: 'rt-2026',
        userId: 'u',
        roleIds: ['moderator'],
        permissions: ['posts.pin'],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
    };

    it('keeps only class permissions for memberships', () => {
        expect(classPermissionsForRoles(['admin', 'moderator'], roles)).toEqual(
            ['comments.delete_any', 'posts.create', 'posts.pin'],
        );
    });

    it('only needs the class permissions to be grantable in a class', () => {
        expect(canGrantClassRole(roles[2], [])).toBe(true);
        expect(canGrantRole(roles[2], [])).toBe(false);
    });

    it('grants from the membership in that class only', () => {
        expect(hasClassPermission(student, membership, 'posts.pin')).toBe(true);
        expect(hasClassPermission(student, undefined, 'posts.pin')).toBe(false);
        expect(
            hasClassPermission(
                { ...student, deletedAt: {} as Timestamp },
                membership,
                'posts.pin',
            ),
        ).toBe(false);
    });

    it('lets app-wide permissions apply in every class', () => {
        expect(
            hasClassPermission(
                { ...student, permissions: ['posts.pin'] },
                undefined,
                'posts.pin',
            ),
        ).toBe(true);
    });
});
