import type { ClassMember } from '@/types';

// What the user form wants a person's class memberships to be.
export type MembershipInput = {
    classId: string;
    roleIds: string[];
    permissions: string[];
};

export function groupMembershipsByUser(memberships: ClassMember[]) {
    const byUser = new Map<string, ClassMember[]>();

    for (const membership of memberships) {
        byUser.set(membership.userId, [
            ...(byUser.get(membership.userId) ?? []),
            membership,
        ]);
    }

    return byUser;
}

function sameList(a: string[], b: string[]) {
    return a.length === b.length && a.every((item) => b.includes(item));
}

// Like syncing a pivot table: which rows to insert, update and delete.
export function diffMemberships(
    previous: ClassMember[],
    next: MembershipInput[],
) {
    const previousByClass = new Map(
        previous.map((membership) => [membership.classId, membership]),
    );
    const nextClassIds = next.map((membership) => membership.classId);

    return {
        create: next.filter(
            (membership) => !previousByClass.has(membership.classId),
        ),
        update: next.filter((membership) => {
            const existing = previousByClass.get(membership.classId);

            return (
                existing !== undefined &&
                (!sameList(existing.roleIds, membership.roleIds) ||
                    !sameList(existing.permissions, membership.permissions))
            );
        }),
        remove: previous.filter(
            (membership) => !nextClassIds.includes(membership.classId),
        ),
    };
}
