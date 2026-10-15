import { describe, expect, it } from 'vitest';

import { DEFAULT_ROLE, PRESIDENT_ROLE, validateClass } from '@/lib/classes';
import { MAX_ROLE_RANK, PERMISSIONS } from '@/lib/permissions';

describe('PRESIDENT_ROLE', () => {
    it('has the top rank and every permission', () => {
        expect(PRESIDENT_ROLE.rank).toBe(MAX_ROLE_RANK);
        expect(PRESIDENT_ROLE.rank).toBeGreaterThan(DEFAULT_ROLE.rank);
        expect(PRESIDENT_ROLE.permissions).toEqual(
            PERMISSIONS.map((permission) => permission.key),
        );
    });
});

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
