import type { User } from 'firebase/auth';
import { createContext } from 'react';

import type { UserContact, UserProfile } from '@/types';

export type AuthContextValue = {
    user: User | null;
    emailVerified: boolean;
    profile: UserProfile | null;
    contact: UserContact | null;
    loading: boolean;
    error: Error | null;
    refreshUser: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
