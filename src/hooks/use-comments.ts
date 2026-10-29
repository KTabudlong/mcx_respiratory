import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import type { QuerySnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useLoadTimeout } from '@/hooks/use-load-timeout';
import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { Comment } from '@/types';

type Part = { key: string; comments: Comment[]; error: Error | null };

// Live lists of a post's comments: `comments` (not deleted, oldest first)
// and `deleted` ("[deleted]" tombstones whose text was moved to the
// archive). The tree is built on the client from ancestorIds.
export function useComments(classId: string, postId: string) {
    const key = `${classId}/${postId}`;
    const [live, setLive] = useState<Part | null>(null);
    const [tombstones, setTombstones] = useState<Part | null>(null);

    useEffect(() => {
        const comments = collection(
            db,
            'classes',
            classId,
            'posts',
            postId,
            'comments',
        );
        const toPart = (set: (part: Part) => void) => (snap: QuerySnapshot) =>
            set({
                key,
                comments: snap.docs.map((item) => docData<Comment>(item)),
                error: null,
            });

        const stopLive = onSnapshot(
            query(
                comments,
                where('deletedAt', '==', null),
                orderBy('createdAt', 'asc'),
            ),
            toPart(setLive),
            (error) => setLive({ key, comments: [], error }),
        );
        const stopTombstones = onSnapshot(
            query(comments, where('body', '==', '')),
            toPart(setTombstones),
            (error) => setTombstones({ key, comments: [], error }),
        );

        return () => {
            stopLive();
            stopTombstones();
        };
    }, [key, classId, postId]);

    const currentLive = live?.key === key ? live : null;
    const currentTombstones = tombstones?.key === key ? tombstones : null;
    const loading = currentLive === null || currentTombstones === null;
    const timeout = useLoadTimeout(key, loading);

    return {
        comments: currentLive?.comments ?? [],
        deleted: currentTombstones?.comments ?? [],
        loading: loading && timeout === null,
        error: currentLive?.error ?? currentTombstones?.error ?? timeout,
    };
}
