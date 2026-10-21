import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { CommentNode } from '@/lib/comment-tree';
import { buildCommentTree, countComments } from '@/lib/comment-tree';
import type { Comment } from '@/types';

function makeComment(
    id: string,
    ancestorIds: string[],
    at: number,
    score = 0,
): Comment {
    const time = { toMillis: () => at } as Timestamp;

    return {
        id,
        classId: 'c',
        postId: 'p',
        userId: 'u',
        parentId: ancestorIds.at(-1) ?? null,
        ancestorIds,
        body: id,
        score,
        createdAt: time,
        updatedAt: time,
        deletedAt: null,
    };
}

// Compact view of a tree: id (or "[x]" for placeholders) and children.
type Shape = [string, Shape[]];

function shape(nodes: CommentNode[]): Shape[] {
    return nodes.map((node) => [
        node.comment ? node.id : `[${node.id}]`,
        shape(node.children),
    ]);
}

describe('buildCommentTree', () => {
    it('nests replies under their parents, oldest first', () => {
        const tree = buildCommentTree([
            makeComment('b', [], 2),
            makeComment('a1', ['a'], 3),
            makeComment('a', [], 1),
            makeComment('a1x', ['a', 'a1'], 4),
        ]);

        expect(shape(tree)).toEqual([
            ['a', [['a1', [['a1x', []]]]]],
            ['b', []],
        ]);
    });

    it('keeps replies of missing deleted comments under a placeholder, last', () => {
        // "a" (top level) and "a1" were deleted before tombstones existed.
        const tree = buildCommentTree([
            makeComment('b', [], 2),
            makeComment('a1x', ['a', 'a1'], 4),
        ]);

        expect(shape(tree)).toEqual([
            ['b', []],
            ['[a]', [['[a1]', [['a1x', []]]]]],
        ]);
    });

    it('shows tombstones as placeholders in their own place, even without replies', () => {
        const tree = buildCommentTree(
            [makeComment('a', [], 1), makeComment('c', [], 3)],
            [makeComment('b', [], 2)],
        );

        expect(shape(tree)).toEqual([
            ['a', []],
            ['[b]', []],
            ['c', []],
        ]);
    });

    const scored = [
        makeComment('a', [], 1, 2),
        makeComment('b', [], 2, 5),
        makeComment('c', [], 3, 2),
        makeComment('a1', ['a'], 4, 0),
        makeComment('a2', ['a'], 5, 3),
    ];

    it('sorts every level by own score, high first, ties newest first', () => {
        const tree = buildCommentTree(scored, [], { by: 'score', dir: 'desc' });

        expect(shape(tree)).toEqual([
            ['b', []],
            ['c', []],
            [
                'a',
                [
                    ['a2', []],
                    ['a1', []],
                ],
            ],
        ]);
    });

    it('sorts by score low first, ties still newest first', () => {
        const tree = buildCommentTree(scored, [], { by: 'score', dir: 'asc' });

        expect(shape(tree)).toEqual([
            ['c', []],
            [
                'a',
                [
                    ['a1', []],
                    ['a2', []],
                ],
            ],
            ['b', []],
        ]);
    });

    it('sorts by date newest first', () => {
        const tree = buildCommentTree(scored, [], { by: 'date', dir: 'desc' });

        expect(shape(tree)).toEqual([
            ['c', []],
            ['b', []],
            [
                'a',
                [
                    ['a2', []],
                    ['a1', []],
                ],
            ],
        ]);
    });
});

describe('countComments', () => {
    it('counts live comments only', () => {
        const tree = buildCommentTree(
            [makeComment('a1', ['a'], 3), makeComment('a2', ['a'], 4)],
            [makeComment('a', [], 1)],
        );

        expect(countComments(tree)).toBe(2);
    });
});
