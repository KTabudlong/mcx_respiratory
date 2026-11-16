import { postMatches } from '@/lib/posts';
import type { Sort } from '@/lib/table-sort';
import { sortRows } from '@/lib/table-sort';
import type { Comment, Post, UserProfile } from '@/types';

export type ModerationStatus = 'all' | 'live' | 'deleted';

export type ModerationSortKey = 'title' | 'author' | 'posted' | 'status';

export const MODERATION_SORT_KEYS: ModerationSortKey[] = [
    'title',
    'author',
    'posted',
    'status',
];

// The order when no header is selected (sort = null): newest first.
const DEFAULT_SORT: Sort<ModerationSortKey> = { key: 'posted', dir: 'desc' };

type Author = Pick<UserProfile, 'firstName' | 'lastName'>;

// Comments whose text contains the search, grouped by post (post id → set
// of comment ids). Tombstones are matched on their archived text.
export function commentHits(
    comments: Comment[],
    archived: Map<string, string>,
    query: string,
) {
    const search = query.trim().toLowerCase();
    const hits = new Map<string, Set<string>>();

    if (search === '') {
        return hits;
    }

    for (const comment of comments) {
        const body = archived.get(comment.id) ?? comment.body;

        if (body.toLowerCase().includes(search)) {
            hits.set(
                comment.postId,
                (hits.get(comment.postId) ?? new Set()).add(comment.id),
            );
        }
    }

    return hits;
}

// One comment plus every reply under it, in thread order (for restore
// previews and similar).
export function commentSubtree(comments: Comment[], root: Comment) {
    return threadOrder(comments).filter(
        (comment) =>
            comment.id === root.id || comment.ancestorIds.includes(root.id),
    );
}

// A post's comments as a flat list in thread order: each reply right under
// its parent, oldest first at every level (the list indents by depth).
export function threadOrder(comments: Comment[]) {
    const createdAt = new Map(
        comments.map((comment) => [comment.id, comment.createdAt.toMillis()]),
    );
    const pathOf = (comment: Comment) => [...comment.ancestorIds, comment.id];

    return [...comments].sort((a, b) => {
        const left = pathOf(a);
        const right = pathOf(b);
        // The first level where the two threads split decides the order.
        const split = left.findIndex((id, i) => id !== right[i]);

        if (split === -1 || split >= right.length) {
            return left.length - right.length;
        }

        return (
            (createdAt.get(left[split]) ?? 0) -
                (createdAt.get(right[split]) ?? 0) ||
            left[split].localeCompare(right[split])
        );
    });
}

// The part of a thread that matters for a search: matching comments, the
// comments above them (their thread) and their replies. Unrelated threads
// are left out.
export function matchedThreads(comments: Comment[], matchIds: Set<string>) {
    const ancestorIds = new Set(
        comments
            .filter((comment) => matchIds.has(comment.id))
            .flatMap((comment) => comment.ancestorIds),
    );

    return comments.filter(
        (comment) =>
            matchIds.has(comment.id) ||
            ancestorIds.has(comment.id) ||
            comment.ancestorIds.some((id) => matchIds.has(id)),
    );
}

// Status filter + search (title, text, or one of its comments in `hits`)
// + column sort.
export function moderationRows(
    posts: Post[],
    authors: Map<string, Author>,
    {
        status,
        query,
        sort,
        hits = new Map(),
    }: {
        status: ModerationStatus;
        query: string;
        sort: Sort<ModerationSortKey> | null;
        hits?: Map<string, Set<string>>;
    },
) {
    const { key, dir } = sort ?? DEFAULT_SORT;
    const search = query.trim().toLowerCase();
    const matching = posts.filter(
        (post) =>
            (status === 'all' ||
                (status === 'deleted') === (post.deletedAt !== null)) &&
            (postMatches(post, search) || hits.has(post.id)),
    );

    return sortRows(
        matching,
        (post) => {
            const author = authors.get(post.userId);

            switch (key) {
                case 'title':
                    return post.title;
                case 'author':
                    return author
                        ? `${author.firstName} ${author.lastName}`
                        : '';
                case 'status':
                    return post.deletedAt === null ? 0 : 1;
                default:
                    return post.createdAt.toMillis();
            }
        },
        dir,
    );
}
