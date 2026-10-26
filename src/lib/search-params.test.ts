import { describe, expect, it } from 'vitest';

import { pickParam } from '@/lib/search-params';

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
