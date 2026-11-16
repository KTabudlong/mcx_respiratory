import { describe, expect, it } from 'vitest';

import { validateRole } from '@/lib/class-roles';

describe('validateRole', () => {
    const valid = {
        name: 'Treasurer',
        color: '#2563eb',
        rank: 50,
        permissions: ['students.view'],
    };

    it('accepts a valid role ranked below the editor', () => {
        expect(validateRole(valid, 100)).toBe('');
        expect(validateRole(valid, Number.POSITIVE_INFINITY)).toBe('');
    });

    it('requires a name and a hex color', () => {
        expect(validateRole({ ...valid, name: '  ' }, 100)).toBe(
            'Role name is required.',
        );
        expect(validateRole({ ...valid, color: 'blue' }, 100)).toBe(
            'Pick a color.',
        );
    });

    it('rejects out-of-range or non-integer ranks', () => {
        expect(validateRole({ ...valid, rank: 0 }, 100)).not.toBe('');
        expect(validateRole({ ...valid, rank: 1001 }, 2000)).not.toBe('');
        expect(validateRole({ ...valid, rank: 2.5 }, 100)).not.toBe('');
    });

    it("rejects ranks at or above the editor's own", () => {
        expect(validateRole({ ...valid, rank: 100 }, 100)).toBe(
            "Rank must be below your own role's rank (100).",
        );
    });
});
