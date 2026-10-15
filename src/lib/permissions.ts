import type { ClassRole, Comment, Post } from '@/types';

// Class permissions are code constants, not data: each one only works once
// the app and firestore.rules check it. Each class's roles store a list of
// these keys. Everything applies inside that class only.
export const PERMISSIONS = [
    {
        key: 'admin.access',
        label: 'Open the admin panel for this class',
    },
    { key: 'students.view', label: 'See the class roster' },
    {
        key: 'students.manage',
        label: 'Approve, add, change the role of and remove students',
    },
    { key: 'roles.manage', label: 'Create and edit roles below their own' },
    { key: 'posts.create', label: 'Create posts' },
    { key: 'posts.edit_any', label: "Edit anyone's posts" },
    { key: 'posts.delete_any', label: "Delete anyone's posts" },
    { key: 'posts.pin', label: 'Pin posts' },
    { key: 'comments.delete_any', label: "Delete anyone's comments" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]['key'];

// The rules' rank checks treat super admins as outranking everything.
export const SUPER_ADMIN_RANK = Number.POSITIVE_INFINITY;

export const MIN_ROLE_RANK = 1;
export const MAX_ROLE_RANK = 1000;

// What the signed-in user can do in one class. `role` is undefined when
// they're not a member (super admins still get everything).
export type ClassAccess = {
    isSuperAdmin: boolean;
    role: ClassRole | undefined;
};

export function hasClassPermission(
    access: ClassAccess,
    permission: Permission,
) {
    return (
        access.isSuperAdmin ||
        (access.role?.permissions.includes(permission) ?? false)
    );
}

export function myRank(access: ClassAccess) {
    if (access.isSuperAdmin) {
        return SUPER_ADMIN_RANK;
    }

    return access.role?.rank ?? 0;
}

// Mirrors the rules' outranks(): strictly below your own rank.
export function outranks(access: ClassAccess, rank: number) {
    return rank < myRank(access);
}

// Mirrors the no-escalation rule: only permissions your own role has.
export function grantablePermissions(access: ClassAccess): string[] {
    if (access.isSuperAdmin) {
        return PERMISSIONS.map((permission) => permission.key);
    }

    return access.role?.permissions ?? [];
}

// The role picker for adding/changing a member: roles ranked below yours,
// highest first.
export function assignableRoles(roles: ClassRole[], access: ClassAccess) {
    return roles
        .filter((role) => outranks(access, role.rank))
        .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));
}

// Self sign-ups are approved with the lowest-ranked role you can assign.
export function defaultRole(roles: ClassRole[], access: ClassAccess) {
    return assignableRoles(roles, access).at(-1);
}

// Mirrors the posts rules: authors edit/delete their own posts; edit_any,
// delete_any and pin cover everyone's. Archived classes are read-only except
// for deleting.
export function postAbilities(
    post: Pick<Post, 'userId'>,
    userId: string | undefined,
    access: ClassAccess,
    classOpen: boolean,
) {
    const isAuthor = post.userId === userId;

    return {
        canEdit:
            classOpen &&
            (isAuthor || hasClassPermission(access, 'posts.edit_any')),
        canPin: classOpen && hasClassPermission(access, 'posts.pin'),
        canDelete: isAuthor || hasClassPermission(access, 'posts.delete_any'),
    };
}

// Mirrors the comments rules: anyone in the class replies (up to the depth
// limit), only the author edits, the author or comments.delete_any deletes.
export function commentAbilities(
    comment: Pick<Comment, 'userId' | 'ancestorIds'>,
    userId: string | undefined,
    access: ClassAccess,
    classOpen: boolean,
    maxDepth: number,
) {
    const isAuthor = comment.userId === userId;

    return {
        canReply: classOpen && comment.ancestorIds.length < maxDepth,
        canEdit: classOpen && isAuthor,
        canDelete:
            isAuthor || hasClassPermission(access, 'comments.delete_any'),
    };
}
