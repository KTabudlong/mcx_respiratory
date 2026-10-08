import type { User } from 'firebase/auth';
import { createContext } from 'react';

import type { Permission } from '@/lib/permissions';
import type { ClassMember, UserContact, UserProfile } from '@/types';

export type AuthContextValue = {
    user: User | null;
    emailVerified: boolean;
    profile: UserProfile | null;
    contact: UserContact | null;
    // The signed-in user's class memberships (pivot rows).
    memberships: ClassMember[];
    loading: boolean;
    error: Error | null;
    refreshUser: () => Promise<boolean>;
    // UI convenience only — firestore.rules enforce the same checks.
    // can: app-wide permission. canIn: permission inside one class.
    can: (permission: Permission) => boolean;
    canIn: (classId: string, permission: Permission) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
