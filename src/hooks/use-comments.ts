import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { Comment } from '@/types';

type Snapshot = { key: string; comments: Comment[]; error: Error | null };

// Live list of a post's comments (deleted ones excluded), oldest first.
// The tree is built on the client from ancestorIds.
export function useComments(classId: string, postId: string) {
    const key = `${classId}/${postId}`;
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    useEffect(
        () =>
            onSnapshot(
                query(
                    collection(
                        db,
                        'classes',
                        classId,
                        'posts',
                        postId,
                        'comments',
                    ),
                    where('deletedAt', '==', null),
                    orderBy('createdAt', 'asc'),
                ),
                (snap) =>
                    setSnapshot({
                        key,
                        comments: snap.docs.map((item) =>
                            docData<Comment>(item),
                        ),
                        error: null,
                    }),
                (error) => setSnapshot({ key, comments: [], error }),
            ),
        [key, classId, postId],
    );

    const current = snapshot?.key === key ? snapshot : null;

    return {
        comments: current?.comments ?? [],
        loading: current === null,
        error: current?.error ?? null,
    };
}
