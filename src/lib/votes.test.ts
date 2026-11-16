import { describe, expect, it } from 'vitest';

import { commentPath, nextVote, postPath, scoreChange } from '@/lib/votes';

describe('nextVote', () => {
    it('casts a vote when there is none', () => {
        expect(nextVote(null, 1)).toBe(1);
        expect(nextVote(null, -1)).toBe(-1);
    });

    it('removes the vote when you tap it again', () => {
        expect(nextVote(1, 1)).toBeNull();
        expect(nextVote(-1, -1)).toBeNull();
    });

    it('switches to the other vote', () => {
        expect(nextVote(1, -1)).toBe(-1);
        expect(nextVote(-1, 1)).toBe(1);
    });
});

describe('scoreChange', () => {
    it('moves the score by the difference', () => {
        expect(scoreChange(null, 1)).toBe(1);
        expect(scoreChange(null, -1)).toBe(-1);
        expect(scoreChange(1, null)).toBe(-1);
        expect(scoreChange(-1, null)).toBe(1);
        expect(scoreChange(1, -1)).toBe(-2);
        expect(scoreChange(-1, 1)).toBe(2);
    });
});

describe('paths', () => {
    it('builds post and comment paths', () => {
        expect(postPath('c1', 'p1')).toBe('classes/c1/posts/p1');
        expect(commentPath('c1', 'p1', 'x1')).toBe(
            'classes/c1/posts/p1/comments/x1',
        );
    });
});
