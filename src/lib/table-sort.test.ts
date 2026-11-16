import { describe, expect, it } from 'vitest';

import { nextSort, sortRows } from '@/lib/table-sort';

describe('nextSort', () => {
    it('cycles ascending, descending, unsorted on the same column', () => {
        expect(nextSort(null, 'title')).toEqual({ key: 'title', dir: 'asc' });
        expect(nextSort({ key: 'title', dir: 'asc' }, 'title')).toEqual({
            key: 'title',
            dir: 'desc',
        });
        expect(nextSort({ key: 'title', dir: 'desc' }, 'title')).toBeNull();
    });

    it('starts another column at ascending', () => {
        expect(nextSort({ key: 'title', dir: 'desc' }, 'posted')).toEqual({
            key: 'posted',
            dir: 'asc',
        });
    });
});

describe('sortRows', () => {
    const rows = [
        { name: 'beta', n: 2 },
        { name: 'Alpha', n: 3 },
        { name: 'gamma', n: 1 },
    ];

    it('sorts text case-insensitively', () => {
        expect(
            sortRows(rows, (row) => row.name, 'asc').map((row) => row.n),
        ).toEqual([3, 2, 1]);
    });

    it('sorts numbers descending without changing the input', () => {
        expect(
            sortRows(rows, (row) => row.n, 'desc').map((row) => row.n),
        ).toEqual([3, 2, 1]);
        expect(rows[0].name).toBe('beta');
    });
});
