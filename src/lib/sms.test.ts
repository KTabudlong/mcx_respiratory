import { describe, expect, it } from 'vitest';

import { inBatches, smsLink, smsPlatform } from '@/lib/sms';

describe('smsPlatform', () => {
    it('detects Apple devices', () => {
        expect(
            smsPlatform(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
            ),
        ).toBe('apple');
        expect(
            smsPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/140'),
        ).toBe('other');
    });
});

describe('smsLink', () => {
    const phones = ['+13125550101', '+13125550102'];

    it('builds the Android / default format', () => {
        expect(smsLink(phones, 'Quiz moved to 9am & room B', 'other')).toBe(
            'sms:+13125550101,+13125550102?body=Quiz%20moved%20to%209am%20%26%20room%20B',
        );
    });

    it('builds the Apple format', () => {
        expect(smsLink(phones, 'Hi', 'apple')).toBe(
            'sms:/open?addresses=+13125550101,+13125550102&body=Hi',
        );
    });

    it('leaves out an empty message', () => {
        expect(smsLink(phones, '  ', 'other')).toBe(
            'sms:+13125550101,+13125550102',
        );
    });
});

describe('inBatches', () => {
    it('splits into groups of the given size', () => {
        expect(inBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(inBatches([], 30)).toEqual([]);
    });
});
