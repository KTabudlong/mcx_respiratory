import type { UserProfile } from '@/types';

export type SignupStep = 'account' | 'verify' | 'profile' | 'done';

export const SIGNUP_STEPS: { step: SignupStep; label: string }[] = [
    { step: 'account', label: 'Account' },
    { step: 'verify', label: 'Verify email' },
    { step: 'profile', label: 'Profile' },
    { step: 'done', label: 'Done' },
];

// The step comes from account state, so closing the tab and logging in
// again resumes where the user left off.
export function getSignupStep({
    signedIn,
    emailVerified,
    hasProfile,
    hasContact,
}: {
    signedIn: boolean;
    emailVerified: boolean;
    hasProfile: boolean;
    hasContact: boolean;
}): SignupStep {
    if (!signedIn) {
        return 'account';
    }

    if (!emailVerified) {
        return 'verify';
    }

    if (!hasProfile || !hasContact) {
        return 'profile';
    }

    return 'done';
}

export type UserStatus = 'active' | 'pending' | 'deactivated';

// Pending = in no class and no app-wide role (app-wide roles apply in every
// class).
export function getUserStatus(
    profile: UserProfile,
    classCount: number,
): UserStatus {
    if (profile.deletedAt !== null) {
        return 'deactivated';
    }

    return classCount > 0 || profile.roleIds.length > 0 ? 'active' : 'pending';
}

export function isApproved(profile: UserProfile | null, classCount: number) {
    return profile !== null && getUserStatus(profile, classCount) === 'active';
}
