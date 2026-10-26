import type { Comment } from '@/types';

// Each level is ordered by the comment's own score or by its date. Score
// ties go newest first.
export type CommentSort = { by: 'score' | 'date'; dir: 'asc' | 'desc' };

export const DEFAULT_COMMENT_SORT: CommentSort = { by: 'score', dir: 'desc' };

// A node is a live comment, or a "[deleted]" placeholder (comment: null):
// a tombstone, or an older deleted comment that's simply missing, kept so
// its replies stay in place. `tombstone` is the deleted comment's doc when
// it's a tombstone (moderators restore it). `sortBy` is null when nothing is
// known about it (those sort last).
export type CommentNode = {
    id: string;
    comment: Comment | null;
    tombstone: Comment | null;
    sortBy: { score: number; createdAt: number } | null;
    children: CommentNode[];
};

function sortKey(comment: Comment) {
    return {
        score: comment.score ?? 0,
        createdAt: comment.createdAt.toMillis(),
    };
}

function compareNodes(sort: CommentSort) {
    const sign = sort.dir === 'asc' ? 1 : -1;

    return (a: CommentNode, b: CommentNode) => {
        if (!a.sortBy || !b.sortBy) {
            return a.sortBy ? -1 : b.sortBy ? 1 : 0;
        }

        if (sort.by === 'score' && a.sortBy.score !== b.sortBy.score) {
            return sign * (a.sortBy.score - b.sortBy.score);
        }

        return sort.by === 'score'
            ? b.sortBy.createdAt - a.sortBy.createdAt
            : sign * (a.sortBy.createdAt - b.sortBy.createdAt);
    };
}

function sortLevel(nodes: CommentNode[], sort: CommentSort) {
    nodes.sort(compareNodes(sort));
    nodes.forEach((node) => sortLevel(node.children, sort));
}

// Builds the reply tree from flat lists (any order). Each comment's
// ancestorIds says where it hangs, so a missing ancestor becomes a
// placeholder at the right depth. Every level is sorted the same way.
export function buildCommentTree(
    comments: Comment[],
    deleted: Comment[] = [],
    sort: CommentSort = { by: 'date', dir: 'asc' },
) {
    const byId = new Map<string, { comment: Comment; live: boolean }>();

    deleted.forEach((comment) =>
        byId.set(comment.id, { comment, live: false }),
    );
    comments.forEach((comment) =>
        byId.set(comment.id, { comment, live: true }),
    );

    const nodes = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    function nodeFor(id: string, parent: CommentNode | null) {
        let node = nodes.get(id);

        if (!node) {
            const known = byId.get(id);

            node = {
                id,
                comment: known?.live ? known.comment : null,
                tombstone: known && !known.live ? known.comment : null,
                sortBy: known ? sortKey(known.comment) : null,
                children: [],
            };
            nodes.set(id, node);
            (parent ? parent.children : roots).push(node);
        }

        return node;
    }

    for (const { comment } of byId.values()) {
        let parent: CommentNode | null = null;

        for (const ancestorId of comment.ancestorIds) {
            parent = nodeFor(ancestorId, parent);
        }

        nodeFor(comment.id, parent);
    }

    sortLevel(roots, sort);

    return roots;
}

// Live comments in a subtree (shown when a thread is collapsed).
export function countComments(nodes: CommentNode[]): number {
    return nodes.reduce(
        (total, node) =>
            total + (node.comment ? 1 : 0) + countComments(node.children),
        0,
    );
}
