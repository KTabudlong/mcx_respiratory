import { describe, expect, it } from 'vitest';

import { isAllowedEmail } from '@/lib/config';

describe('isAllowedEmail', () => {
    it('accepts student and instructor school emails', () => {
        expect(isAllowedEmail('jane.doe@student.ccc.edu')).toBe(true);
        expect(isAllowedEmail('prof@ccc.edu')).toBe(true);
    });

    it('ignores case and surrounding spaces', () => {
        expect(isAllowedEmail('  Jane.Doe@Student.CCC.edu ')).toBe(true);
    });

    it('rejects other domains', () => {
        expect(isAllowedEmail('jane@gmail.com')).toBe(false);
        expect(isAllowedEmail('jane@notccc.edu')).toBe(false);
        expect(isAllowedEmail('jane@evil.ccc.edu')).toBe(false);
        expect(isAllowedEmail('jane@ccc.edu.evil.com')).toBe(false);
    });

    it('rejects malformed addresses', () => {
        expect(isAllowedEmail('')).toBe(false);
        expect(isAllowedEmail('@ccc.edu')).toBe(false);
        expect(isAllowedEmail('jane@x@ccc.edu')).toBe(false);
        expect(isAllowedEmail('ccc.edu')).toBe(false);
    });
});
