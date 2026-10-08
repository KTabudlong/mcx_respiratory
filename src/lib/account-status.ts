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

export function isApproved(profile: UserProfile | null) {
    return (
        profile !== null &&
        profile.deletedAt === null &&
        profile.classIds.length > 0
    );
}
