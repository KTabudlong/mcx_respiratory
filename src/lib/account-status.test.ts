import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { getSignupStep, isApproved } from '@/lib/account-status';
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

describe('isApproved', () => {
    const profile = {
        id: 'u1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@student.ccc.edu',
        classIds: ['rt-2026'],
        roleIds: ['student'],
        permissions: [],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
        deletedAt: null,
    } satisfies UserProfile;

    it('approves active users with at least one class', () => {
        expect(isApproved(profile)).toBe(true);
    });

    it('treats users without a class as pending', () => {
        expect(isApproved({ ...profile, classIds: [] })).toBe(false);
    });

    it('rejects soft-deleted users and missing profiles', () => {
        expect(isApproved({ ...profile, deletedAt: {} as Timestamp })).toBe(
            false,
        );
        expect(isApproved(null)).toBe(false);
    });
});
