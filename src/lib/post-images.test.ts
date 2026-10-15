import { describe, expect, it } from 'vitest';

import { fitWithin } from '@/lib/post-images';

describe('fitWithin', () => {
    it('scales the longer side down to the max', () => {
        expect(fitWithin(4000, 3000, 1600)).toEqual({
            width: 1600,
            height: 1200,
        });
        expect(fitWithin(3000, 4000, 1600)).toEqual({
            width: 1200,
            height: 1600,
        });
    });

    it('never scales up', () => {
        expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    });
});
