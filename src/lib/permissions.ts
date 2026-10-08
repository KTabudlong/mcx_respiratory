import type { ClassMember, Role, UserProfile } from '@/types';

// Permissions are code constants, not data: each one only works once the app
// and firestore.rules check it. Roles (data) store a list of these keys.
// Class permissions apply inside a class; app permissions only come from
// app-wide roles (users.roleIds).
export const PERMISSIONS = [
    { key: 'posts.create', label: 'Create posts', scope: 'class' },
    { key: 'posts.edit_any', label: "Edit anyone's posts", scope: 'class' },
    { key: 'posts.delete_any', label: "Delete anyone's posts", scope: 'class' },
    { key: 'posts.pin', label: 'Pin posts', scope: 'class' },
    {
        key: 'comments.delete_any',
        label: "Delete anyone's comments",
        scope: 'class',
    },
    {
        key: 'users.view',
        label: 'View users and contact numbers',
        scope: 'app',
    },
    {
        key: 'users.manage',
        label: 'Add, edit, approve and deactivate users',
        scope: 'app',
    },
    { key: 'roles.manage', label: 'Manage roles', scope: 'app' },
    { key: 'classes.manage', label: 'Manage classes', scope: 'app' },
] as const;

export type Permission = (typeof PERMISSIONS)[number]['key'];

const CLASS_PERMISSION_KEYS: string[] = PERMISSIONS.filter(
    (permission) => permission.scope === 'class',
).map((permission) => permission.key);

// Any of these opens the admin panel.
export const ADMIN_PERMISSIONS: Permission[] = [
    'users.view',
    'users.manage',
    'roles.manage',
    'classes.manage',
    'posts.delete_any',
    'comments.delete_any',
];

// App-wide permission check (from users.permissions).
export function hasPermission(
    profile: UserProfile | null,
    permission: Permission,
) {
    return (
        profile !== null &&
        profile.deletedAt === null &&
        profile.permissions.includes(permission)
    );
}

// Class-scoped check: app-wide roles apply in every class, plus whatever the
// membership in this class grants. Mirrors the rules' canIn().
export function hasClassPermission(
    profile: UserProfile | null,
    membership: ClassMember | undefined,
    permission: Permission,
) {
    return (
        hasPermission(profile, permission) ||
        (profile !== null &&
            profile.deletedAt === null &&
            membership !== undefined &&
            membership.permissions.includes(permission))
    );
}

export function hasAdminAccess(profile: UserProfile | null) {
    return ADMIN_PERMISSIONS.some((permission) =>
        hasPermission(profile, permission),
    );
}

// Stored copies of the union of roles' permissions, because security rules
// can't loop over roles: users.permissions (app-wide roles, everything) and
// members.permissions (class roles, class permissions only).
export function permissionsForRoles(roleIds: string[], roles: Role[]) {
    const permissions = new Set<string>();

    for (const role of roles) {
        if (roleIds.includes(role.id)) {
            role.permissions.forEach((permission) =>
                permissions.add(permission),
            );
        }
    }

    return [...permissions].sort();
}

export function classPermissionsForRoles(roleIds: string[], roles: Role[]) {
    return permissionsForRoles(roleIds, roles).filter((permission) =>
        CLASS_PERMISSION_KEYS.includes(permission),
    );
}

// Mirrors the no-privilege-escalation rule: you can only grant permissions
// you hold yourself.
export function canGrantRole(role: Role, ownPermissions: string[]) {
    return role.permissions.every((permission) =>
        ownPermissions.includes(permission),
    );
}

// In a class only the role's class permissions are stored, so only those
// need to be grantable.
export function canGrantClassRole(role: Role, ownPermissions: string[]) {
    return classPermissionsForRoles([role.id], [role]).every((permission) =>
        ownPermissions.includes(permission),
    );
}
