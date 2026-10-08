import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { AuthContext } from '@/context/auth-context';
import { useDocument } from '@/hooks/use-document';
import { reloadCurrentUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import type { UserContact, UserProfile } from '@/types';

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

    // user.reload() mutates the same User object, so copy emailVerified into
    // state to re-render.
    async function refreshUser() {
        await reloadCurrentUser();

        const emailVerified = auth.currentUser?.emailVerified ?? false;

        setSession((current) => ({ ...current, emailVerified }));

        return emailVerified;
    }

    return (
        <AuthContext
            value={{
                user: session.user,
                emailVerified: session.emailVerified,
                profile: profile.data,
                contact: contact.data,
                loading: !session.ready || profile.loading || contact.loading,
                error: profile.error ?? contact.error,
                refreshUser,
            }}
        >
            {children}
        </AuthContext>
    );
}
