import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { AuthContextValue } from '@/context/auth-context';
import { AuthContext } from '@/context/auth-context';
import { useMyMemberships } from '@/hooks/use-collection-group';
import { useDocument } from '@/hooks/use-document';
import { useDocuments } from '@/hooks/use-documents';
import { reloadCurrentUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { hasClassPermission } from '@/lib/permissions';
import type { ClassRole, UserContact, UserProfile } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<{
        user: User | null;
        emailVerified: boolean;
        ready: boolean;
    }>({ user: null, emailVerified: false, ready: false });

    useEffect(
        () =>
            onAuthStateChanged(auth, (user) =>
                setSession({
                    user,
                    emailVerified: user?.emailVerified ?? false,
                    ready: true,
                }),
            ),
        [],
    );

    const uid = session.user?.uid ?? null;
    const profile = useDocument<UserProfile>(uid ? `users/${uid}` : null);
    const contact = useDocument<UserContact>(
        uid ? `userContacts/${uid}` : null,
    );
    // Class rules need an active users doc, so wait for it.
    const activeUid = profile.data?.deletedAt === null ? uid : null;
    const admin = useDocument<{ id: string }>(
        activeUid ? `admins/${activeUid}` : null,
    );
    const memberships = useMyMemberships(activeUid);
    const roles = useDocuments<ClassRole>(
        memberships.data.map(
            (membership) =>
                `classes/${membership.classId}/roles/${membership.roleId}`,
        ),
    );

    // user.reload() mutates the same User object, so copy emailVerified into
    // state to re-render.
    async function refreshUser() {
        await reloadCurrentUser();

        const emailVerified = auth.currentUser?.emailVerified ?? false;

        setSession((current) => ({ ...current, emailVerified }));

        return emailVerified;
    }

    const isSuperAdmin = admin.data !== null;
    const adminClassIds = roles.data
        .filter((role) => role.permissions.includes('admin.access'))
        .map((role) => role.classId);

    function accessIn(classId: string) {
        const membership = memberships.data.find(
            (item) => item.classId === classId,
        );

        return {
            isSuperAdmin,
            role: membership
                ? roles.data.find(
                      (role) =>
                          role.classId === classId &&
                          role.id === membership.roleId,
                  )
                : undefined,
        };
    }

    const value: AuthContextValue = {
        user: session.user,
        emailVerified: session.emailVerified,
        profile: profile.data,
        contact: contact.data,
        isSuperAdmin,
        memberships: memberships.data,
        myRoles: roles.data,
        loading:
            !session.ready ||
            profile.loading ||
            contact.loading ||
            admin.loading ||
            memberships.loading ||
            roles.loading,
        error:
            profile.error ??
            contact.error ??
            admin.error ??
            memberships.error ??
            roles.error,
        refreshUser,
        accessIn,
        canIn: (classId, permission) =>
            hasClassPermission(accessIn(classId), permission),
        adminClassIds,
        hasAdminAccess: isSuperAdmin || adminClassIds.length > 0,
    };

    return <AuthContext value={value}>{children}</AuthContext>;
}
