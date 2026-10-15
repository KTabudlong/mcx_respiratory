import type { User } from 'firebase/auth';
import { createContext } from 'react';

import type { ClassAccess, Permission } from '@/lib/permissions';
import type { ClassMember, ClassRole, UserContact, UserProfile } from '@/types';

export type AuthContextValue = {
    user: User | null;
    emailVerified: boolean;
    profile: UserProfile | null;
    contact: UserContact | null;
    isSuperAdmin: boolean;
    // The signed-in user's class memberships and their role in each class.
    memberships: ClassMember[];
    myRoles: ClassRole[];
    loading: boolean;
    error: Error | null;
    refreshUser: () => Promise<boolean>;
    // UI convenience only — firestore.rules enforce the same checks.
    accessIn: (classId: string) => ClassAccess;
    canIn: (classId: string, permission: Permission) => boolean;
    // Class IDs whose admin panel this user can open (all classes are open
    // to super admins; check isSuperAdmin for those).
    adminClassIds: string[];
    hasAdminAccess: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
