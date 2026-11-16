import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from '@/lib/dates';

describe('formatRelativeTime', () => {
    const now = new Date('2026-10-15T12:00:00Z');
    const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

    it('says "just now" under a minute', () => {
        expect(formatRelativeTime(ago(30), now)).toBe('just now');
    });

    it('uses the largest whole unit', () => {
        expect(formatRelativeTime(ago(5 * 60), now)).toBe('5 minutes ago');
        expect(formatRelativeTime(ago(3 * 3600), now)).toBe('3 hours ago');
        expect(formatRelativeTime(ago(24 * 3600), now)).toBe('yesterday');
        expect(formatRelativeTime(ago(15 * 24 * 3600), now)).toBe(
            '2 weeks ago',
        );
    });
});
