import type { Comment } from '@/types';

// A node is a live comment, or a "[deleted]" placeholder (comment: null)
// kept so its replies stay in place.
export type CommentNode = {
    id: string;
    comment: Comment | null;
    children: CommentNode[];
};

// Builds the reply tree from a flat list (any order). Each comment's
// ancestorIds says where it hangs, so a missing (deleted) ancestor becomes a
// placeholder at the right depth. Siblings are oldest first.
export function buildCommentTree(comments: Comment[]) {
    const sorted = [...comments].sort(
        (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis(),
    );
    const byId = new Map(sorted.map((comment) => [comment.id, comment]));
    const nodes = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    function nodeFor(id: string, parent: CommentNode | null) {
        let node = nodes.get(id);

        if (!node) {
            node = { id, comment: byId.get(id) ?? null, children: [] };
            nodes.set(id, node);
            (parent ? parent.children : roots).push(node);
        }

        return node;
    }

    for (const comment of sorted) {
        let parent: CommentNode | null = null;

        for (const ancestorId of comment.ancestorIds) {
            parent = nodeFor(ancestorId, parent);
        }

        nodeFor(comment.id, parent);
    }

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
