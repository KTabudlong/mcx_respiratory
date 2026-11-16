import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { getSignupStep, getUserStatus, isApproved } from '@/lib/account-status';
import type { UserProfile } from '@/types';

const signedOut = {
    signedIn: false,
    emailVerified: false,
    hasProfile: false,
    hasContact: false,
};

describe('getSignupStep', () => {
    it('starts at the account step when signed out', () => {
        expect(getSignupStep(signedOut)).toBe('account');
    });

    it('asks unverified users to verify their email', () => {
        expect(getSignupStep({ ...signedOut, signedIn: true })).toBe('verify');
    });

    it('asks verified users without a profile or contact doc for their profile', () => {
        const verified = { ...signedOut, signedIn: true, emailVerified: true };

        expect(getSignupStep(verified)).toBe('profile');
        expect(getSignupStep({ ...verified, hasProfile: true })).toBe(
            'profile',
        );
    });

    it('is done once the profile and contact docs exist', () => {
        expect(
            getSignupStep({
                signedIn: true,
                emailVerified: true,
                hasProfile: true,
                hasContact: true,
            }),
        ).toBe('done');
    });
});

describe('getUserStatus / isApproved', () => {
    const profile = {
        id: 'u1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@student.ccc.edu',
        createdBy: null,
        createdInClassId: null,
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
    } satisfies UserProfile;

    it('approves active users in at least one class', () => {
        expect(getUserStatus(profile, 1)).toBe('active');
        expect(isApproved(profile, 1, false)).toBe(true);
    });

    it('approves super admins even without a class', () => {
        expect(getUserStatus(profile, 0, true)).toBe('active');
        expect(isApproved(profile, 0, true)).toBe(true);
    });

    it('treats users in no class as pending', () => {
        expect(getUserStatus(profile, 0)).toBe('pending');
        expect(isApproved(profile, 0, false)).toBe(false);
    });

    it('rejects soft-deleted users (even super admins) and missing profiles', () => {
        const deactivated = { ...profile, deletedAt: {} as Timestamp };

        expect(getUserStatus(deactivated, 1)).toBe('deactivated');
        expect(isApproved(deactivated, 1, true)).toBe(false);
        expect(isApproved(null, 1, false)).toBe(false);
    });
});
