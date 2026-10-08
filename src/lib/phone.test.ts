import { describe, expect, it } from 'vitest';

import { toE164 } from '@/lib/phone';

describe('toE164', () => {
    it('formats US numbers typed in common ways', () => {
        expect(toE164('3125551234')).toBe('+13125551234');
        expect(toE164('(312) 555-1234')).toBe('+13125551234');
        expect(toE164('312.555.1234')).toBe('+13125551234');
        expect(toE164('1 312 555 1234')).toBe('+13125551234');
    });

    it('keeps international numbers that start with +', () => {
        expect(toE164('+63 917 123 4567')).toBe('+639171234567');
        expect(toE164('+1 (312) 555-1234')).toBe('+13125551234');
    });

    it('returns an empty string for an empty input', () => {
        expect(toE164('')).toBe('');
        expect(toE164('   ')).toBe('');
    });

    it('rejects invalid numbers', () => {
        expect(toE164('555-1234')).toBeNull();
        expect(toE164('23125551234')).toBeNull();
        expect(toE164('+0123456789')).toBeNull();
        expect(toE164('+123')).toBeNull();
    });
});
