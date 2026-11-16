import { describe, expect, it } from 'vitest';

import { pickParam, withParams } from '@/lib/search-params';

const TABS = ['active', 'archived', 'requests'] as const;

describe('pickParam', () => {
    it('returns an allowed value', () => {
        expect(pickParam('archived', TABS, 'active')).toBe('archived');
    });

    it('falls back when missing or unknown', () => {
        expect(pickParam(null, TABS, 'active')).toBe('active');
        expect(pickParam('nope', TABS, 'active')).toBe('active');
    });
});

describe('withParams', () => {
    it('sets and removes params, keeping the rest', () => {
        const next = withParams(new URLSearchParams('status=deleted&dir=asc'), {
            sort: 'title',
            dir: null,
        });

        expect(next.toString()).toBe('status=deleted&sort=title');
    });
});
