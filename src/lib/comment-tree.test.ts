import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { CommentNode } from '@/lib/comment-tree';
import { buildCommentTree, countComments } from '@/lib/comment-tree';
import type { Comment } from '@/types';

function makeComment(id: string, ancestorIds: string[], at: number): Comment {
    const time = { toMillis: () => at } as Timestamp;

    return {
        id,
        classId: 'c',
        postId: 'p',
        userId: 'u',
        parentId: ancestorIds.at(-1) ?? null,
        ancestorIds,
        body: id,
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

    it('keeps replies of deleted comments under a placeholder', () => {
        // "a" (top level) and "a1" were deleted; "a1x" survives.
        const tree = buildCommentTree([
            makeComment('b', [], 2),
            makeComment('a1x', ['a', 'a1'], 4),
        ]);

        expect(shape(tree)).toEqual([
            ['b', []],
            ['[a]', [['[a1]', [['a1x', []]]]]],
        ]);
    });
});

describe('countComments', () => {
    it('counts live comments only', () => {
        const tree = buildCommentTree([
            makeComment('a1', ['a'], 3),
            makeComment('a2', ['a'], 4),
        ]);

        expect(countComments(tree)).toBe(2);
    });
});
