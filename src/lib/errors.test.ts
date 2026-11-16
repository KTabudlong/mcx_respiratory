import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '@/lib/errors';

describe('getErrorMessage', () => {
    it('maps known Firebase error codes', () => {
        expect(getErrorMessage({ code: 'auth/invalid-credential' })).toBe(
            'Email or password is incorrect.',
        );
        expect(getErrorMessage({ code: 'permission-denied' })).toBe(
            "You don't have permission to do that.",
        );
        expect(getErrorMessage({ code: 'failed-precondition' })).toMatch(
            /index/i,
        );
    });

    it('falls back to a generic message', () => {
        expect(getErrorMessage({ code: 'auth/something-new' })).toBe(
            'Something went wrong. Please try again.',
        );
        expect(getErrorMessage(new Error('boom'))).toBe(
            'Something went wrong. Please try again.',
        );
        expect(getErrorMessage(null)).toBe(
            'Something went wrong. Please try again.',
        );
    });
});
