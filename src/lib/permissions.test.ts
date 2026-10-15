import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { ClassAccess } from '@/lib/permissions';
import {
    assignableRoles,
    commentAbilities,
    defaultRole,
    grantablePermissions,
    hasClassPermission,
    myRank,
    outranks,
    PERMISSIONS,
    postAbilities,
} from '@/lib/permissions';
import type { ClassRole } from '@/types';

function makeRole(id: string, rank: number, permissions: string[]): ClassRole {
    return {
        id,
        classId: 'class-a',
        name: id,
        color: '#000000',
        rank,
        permissions,
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
    };
}

// The example from the plan: Class A with student / treasurer / president.
const student = makeRole('student', 1, ['posts.create']);
const treasurer = makeRole('treasurer', 50, ['admin.access', 'students.view']);
const president = makeRole('president', 100, [
    'admin.access',
    'students.view',
    'students.manage',
    'roles.manage',
    'posts.create',
]);
const roles = [treasurer, student, president];

const asPresident: ClassAccess = { isSuperAdmin: false, role: president };
const asTreasurer: ClassAccess = { isSuperAdmin: false, role: treasurer };
const asSuperAdmin: ClassAccess = { isSuperAdmin: true, role: undefined };
const outsider: ClassAccess = { isSuperAdmin: false, role: undefined };

describe('hasClassPermission', () => {
    it("checks the role's permissions in this class", () => {
        expect(hasClassPermission(asPresident, 'students.manage')).toBe(true);
        expect(hasClassPermission(asTreasurer, 'students.view')).toBe(true);
        expect(hasClassPermission(asTreasurer, 'students.manage')).toBe(false);
    });

    it('denies non-members and allows super admins everything', () => {
        expect(hasClassPermission(outsider, 'students.view')).toBe(false);
        expect(hasClassPermission(asSuperAdmin, 'roles.manage')).toBe(true);
    });
});

describe('outranks / myRank', () => {
    it('only outranks roles strictly below your own', () => {
        expect(outranks(asPresident, treasurer.rank)).toBe(true);
        expect(outranks(asPresident, president.rank)).toBe(false);
        expect(outranks(asTreasurer, president.rank)).toBe(false);
    });

    it('treats super admins as outranking everything and non-members as nothing', () => {
        expect(myRank(asSuperAdmin)).toBe(Number.POSITIVE_INFINITY);
        expect(outranks(asSuperAdmin, 1000)).toBe(true);
        expect(outranks(outsider, 1)).toBe(false);
    });
});

describe('grantablePermissions', () => {
    it('only lists permissions your own role has (no escalation)', () => {
        expect(grantablePermissions(asTreasurer)).toEqual([
            'admin.access',
            'students.view',
        ]);
        expect(grantablePermissions(outsider)).toEqual([]);
    });

    it('lets super admins grant every permission', () => {
        expect(grantablePermissions(asSuperAdmin)).toHaveLength(
            PERMISSIONS.length,
        );
    });
});

describe('assignableRoles / defaultRole', () => {
    it('lists roles below yours, highest first', () => {
        expect(assignableRoles(roles, asPresident).map((r) => r.id)).toEqual([
            'treasurer',
            'student',
        ]);
        expect(assignableRoles(roles, asSuperAdmin).map((r) => r.id)).toEqual([
            'president',
            'treasurer',
            'student',
        ]);
    });

    it('defaults join requests to the lowest assignable role', () => {
        expect(defaultRole(roles, asPresident)?.id).toBe('student');
        expect(defaultRole([president], asPresident)).toBeUndefined();
    });
});

describe('postAbilities', () => {
    const asStudent: ClassAccess = { isSuperAdmin: false, role: student };
    const moderator: ClassAccess = {
        isSuperAdmin: false,
        role: makeRole('mod', 60, [
            'posts.edit_any',
            'posts.delete_any',
            'posts.pin',
        ]),
    };
    const post = { userId: 'me' };

    it('lets authors edit and delete their own posts, but not pin', () => {
        expect(postAbilities(post, 'me', asStudent, true)).toEqual({
            canEdit: true,
            canPin: false,
            canDelete: true,
        });
        expect(postAbilities(post, 'other', asStudent, true)).toEqual({
            canEdit: false,
            canPin: false,
            canDelete: false,
        });
    });

    it("lets moderators handle anyone's posts", () => {
        expect(postAbilities(post, 'other', moderator, true)).toEqual({
            canEdit: true,
            canPin: true,
            canDelete: true,
        });
    });

    it('only allows deleting in archived classes', () => {
        expect(postAbilities(post, 'me', moderator, false)).toEqual({
            canEdit: false,
            canPin: false,
            canDelete: true,
        });
    });
});

describe('commentAbilities', () => {
    const asStudent: ClassAccess = { isSuperAdmin: false, role: student };
    const moderator: ClassAccess = {
        isSuperAdmin: false,
        role: makeRole('mod', 60, ['comments.delete_any']),
    };
    const comment = { userId: 'me', ancestorIds: ['a', 'b'] };

    it('lets the author edit and delete; anyone may reply', () => {
        expect(commentAbilities(comment, 'me', asStudent, true, 4)).toEqual({
            canReply: true,
            canEdit: true,
            canDelete: true,
        });
        expect(commentAbilities(comment, 'x', asStudent, true, 4)).toEqual({
            canReply: true,
            canEdit: false,
            canDelete: false,
        });
    });

    it('lets moderators delete but never edit others', () => {
        expect(commentAbilities(comment, 'x', moderator, true, 4)).toEqual({
            canReply: true,
            canEdit: false,
            canDelete: true,
        });
    });

    it('stops replies at the depth limit and in archived classes', () => {
        const deep = { userId: 'me', ancestorIds: ['a', 'b', 'c', 'd'] };

        expect(commentAbilities(deep, 'me', asStudent, true, 4).canReply).toBe(
            false,
        );
        expect(
            commentAbilities(comment, 'me', asStudent, false, 4),
        ).toMatchObject({ canReply: false, canEdit: false });
    });
});
