import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { Post } from '@/types';

type Snapshot = {
    key: string;
    classId: string;
    posts: Post[];
    error: Error | null;
};

export type FeedSort = 'new' | 'top';

// Live feed of one class: pinned first, then newest (or highest score, then
// newest). "Load more" raises `count`; like SQL's LIMIT, Firestore re-runs
// the query with the bigger limit (already-loaded posts come from cache).
// Top skips posts without a score field (from before votes) until they're
// backfilled with score 0.
export function usePosts(classId: string, count: number, sort: FeedSort) {
    const key = `${classId}|${count}|${sort}`;
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    useEffect(
        () =>
            onSnapshot(
                query(
                    collection(db, 'classes', classId, 'posts'),
                    where('deletedAt', '==', null),
                    orderBy('pinned', 'desc'),
                    ...(sort === 'top' ? [orderBy('score', 'desc')] : []),
                    orderBy('createdAt', 'desc'),
                    limit(count),
                ),
                (snap) =>
                    setSnapshot({
                        key,
                        classId,
                        posts: snap.docs.map((item) => docData<Post>(item)),
                        error: null,
                    }),
                (error) => setSnapshot({ key, classId, posts: [], error }),
            ),
        [key, classId, count, sort],
    );

    // While a bigger page loads, keep showing the posts already loaded.
    const sameClass = snapshot?.classId === classId ? snapshot : null;
    const current = snapshot?.key === key ? snapshot : null;

    return {
        posts: sameClass?.posts ?? [],
        loading: current === null,
        error: current?.error ?? null,
        hasMore: current !== null && current.posts.length === count,
    };
}

// Moderation list: every post in the class, newest first. Including deleted
// posts needs posts.delete_any (the rules check it), so without it only live
// posts are queried.
export function useModerationPosts(classId: string, includeDeleted: boolean) {
    const key = `${classId}|${includeDeleted}`;
    const [snapshot, setSnapshot] = useState<{
        key: string;
        posts: Post[];
        error: Error | null;
    } | null>(null);

    useEffect(() => {
        const posts = collection(db, 'classes', classId, 'posts');

        return onSnapshot(
            includeDeleted
                ? posts
                : query(posts, where('deletedAt', '==', null)),
            (snap) =>
                setSnapshot({
                    key,
                    posts: snap.docs
                        .map((item) => docData<Post>(item))
                        .sort(
                            (a, b) =>
                                b.createdAt.toMillis() - a.createdAt.toMillis(),
                        ),
                    error: null,
                }),
            (error) => setSnapshot({ key, posts: [], error }),
        );
    }, [key, classId, includeDeleted]);

    const current = snapshot?.key === key ? snapshot : null;

    return {
        posts: current?.posts ?? [],
        loading: current === null,
        error: current?.error ?? null,
    };
}
