import { describe, expect, it } from 'vitest';

import { validateClass } from '@/lib/classes';

describe('validateClass', () => {
    const valid = { name: 'RT Class of 2027', startYear: 2025, endYear: 2027 };

    it('accepts a valid class, with or without an end year', () => {
        expect(validateClass(valid)).toBe('');
        expect(validateClass({ ...valid, endYear: null })).toBe('');
    });

    it('requires a name', () => {
        expect(validateClass({ ...valid, name: '   ' })).toBe(
            'Class name is required.',
        );
    });

    it('rejects out-of-range or non-integer years', () => {
        expect(validateClass({ ...valid, startYear: 1999 })).not.toBe('');
        expect(validateClass({ ...valid, startYear: 2025.5 })).not.toBe('');
        expect(validateClass({ ...valid, startYear: NaN })).not.toBe('');
    });

    it('rejects an end year before the start year', () => {
        expect(validateClass({ ...valid, endYear: 2024 })).toBe(
            'End year must be on or after the start year.',
        );
    });
});
