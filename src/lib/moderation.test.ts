import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import {
    commentHits,
    matchedThreads,
    moderationRows,
    threadOrder,
} from '@/lib/moderation';
import type { Comment, Post } from '@/types';

describe('threadOrder', () => {
    const comment = (id: string, ancestorIds: string[], at: number) =>
        ({ id, ancestorIds, createdAt: Timestamp.fromMillis(at) }) as Comment;

    it('puts replies under their parent, oldest first per level', () => {
        expect(
            threadOrder([
                comment('a', [], 1),
                comment('b', [], 2),
                comment('b1', ['b'], 3),
                comment('a1', ['a'], 4),
                comment('a0', ['a'], 3.5),
                comment('a1x', ['a', 'a1'], 5),
            ]).map((item) => item.id),
        ).toEqual(['a', 'a0', 'a1', 'a1x', 'b', 'b1']);
    });
});

describe('matchedThreads', () => {
    const comment = (id: string, ancestorIds: string[]) =>
        ({ id, ancestorIds }) as Comment;

    // root → A, B, C; B → B1 → B1x; C → C1
    const thread = [
        comment('root', []),
        comment('A', ['root']),
        comment('B', ['root']),
        comment('C', ['root']),
        comment('B1', ['root', 'B']),
        comment('B1x', ['root', 'B', 'B1']),
        comment('C1', ['root', 'C']),
        comment('other', []),
    ];

    it('keeps the match, the comments above it and its replies', () => {
        expect(
            matchedThreads(thread, new Set(['B'])).map((item) => item.id),
        ).toEqual(['root', 'B', 'B1', 'B1x']);
    });

    it('keeps every matching thread', () => {
        expect(
            matchedThreads(thread, new Set(['B1x', 'C1'])).map(
                (item) => item.id,
            ),
        ).toEqual(['root', 'B', 'C', 'B1', 'B1x', 'C1']);
    });
});

describe('commentHits', () => {
    const comment = (id: string, postId: string, body: string) =>
        ({ id, postId, body }) as Comment;

    it('groups matching comments by post, using archived text for tombstones', () => {
        const hits = commentHits(
            [
                comment('x', 'p1', 'Bring GOGGLES'),
                comment('y', 'p1', 'ok'),
                comment('z', 'p2', ''),
            ],
            new Map([['z', 'goggles are in the lab']]),
            'goggles',
        );

        expect([...hits.keys()]).toEqual(['p1', 'p2']);
        expect([...(hits.get('p1') ?? [])]).toEqual(['x']);
    });

    it('finds nothing for an empty search', () => {
        expect(
            commentHits([comment('x', 'p1', 'a')], new Map(), ' ').size,
        ).toBe(0);
    });
});

function makePost(overrides: Partial<Post>): Post {
    return {
        id: 'p',
        classId: 'c',
        userId: 'u1',
        title: 'Title',
        body: '',
        format: 'text',
        createdAt: Timestamp.fromMillis(1000),
        deletedAt: null,
        ...overrides,
    } as Post;
}

const posts = [
    makePost({
        id: 'a',
        title: 'Exam moved',
        body: 'Room 2201',
        userId: 'u2',
        createdAt: Timestamp.fromMillis(3000),
    }),
    makePost({
        id: 'b',
        title: 'Lab notes',
        body: 'Bring goggles',
        deletedAt: Timestamp.fromMillis(5000),
        createdAt: Timestamp.fromMillis(1000),
    }),
    makePost({
        id: 'c',
        title: 'Clinical schedule',
        body: 'See the exam room list',
        createdAt: Timestamp.fromMillis(2000),
    }),
];

const authors = new Map([
    ['u1', { firstName: 'Zoe', lastName: 'Adams' }],
    ['u2', { firstName: 'Ana', lastName: 'Cruz' }],
]);

const ids = (...args: Parameters<typeof moderationRows>) =>
    moderationRows(...args).map((post) => post.id);

describe('moderationRows', () => {
    it('searches the title and the text, newest first when unsorted', () => {
        expect(
            ids(posts, authors, { status: 'all', query: 'EXAM', sort: null }),
        ).toEqual(['a', 'c']);
    });

    it('includes posts matched only through a comment', () => {
        expect(
            ids(posts, authors, {
                status: 'all',
                query: 'goggles',
                sort: null,
                hits: new Map([['c', new Set(['x'])]]),
            }),
        ).toEqual(['c', 'b']);
    });

    it('filters by status', () => {
        expect(
            ids(posts, authors, {
                status: 'deleted',
                query: '',
                sort: { key: 'posted', dir: 'desc' },
            }),
        ).toEqual(['b']);
    });

    it('sorts by each column', () => {
        const all = { status: 'all', query: '' } as const;

        expect(
            ids(posts, authors, { ...all, sort: { key: 'title', dir: 'asc' } }),
        ).toEqual(['c', 'a', 'b']);
        expect(
            ids(posts, authors, {
                ...all,
                sort: { key: 'author', dir: 'asc' },
            }),
        ).toEqual(['a', 'b', 'c']);
        expect(
            ids(posts, authors, {
                ...all,
                sort: { key: 'posted', dir: 'asc' },
            }),
        ).toEqual(['b', 'c', 'a']);
        expect(
            ids(posts, authors, {
                ...all,
                sort: { key: 'status', dir: 'desc' },
            })[0],
        ).toBe('b');
    });
});
