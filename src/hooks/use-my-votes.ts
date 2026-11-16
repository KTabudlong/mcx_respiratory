import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { VoteValue } from '@/types';

type Snapshot = {
    key: string;
    votes: Map<string, VoteValue>;
    error: Error | null;
};

// Live map of your votes in one class, keyed by the voted post / comment
// path (see postPath() / commentPath() in lib/votes). One query covers every
// post and comment, like `SELECT * FROM votes WHERE user_id = ? AND class_id = ?`.
export function useMyVotes(classId: string) {
    const { user } = useAuth();
    const uid = user?.uid;
    const key = uid ? `${uid}|${classId}` : null;
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    useEffect(() => {
        if (!uid || !key) {
            return;
        }

        return onSnapshot(
            query(
                collectionGroup(db, 'votes'),
                where('userId', '==', uid),
                where('classId', '==', classId),
            ),
            (snap) =>
                setSnapshot({
                    key,
                    votes: new Map(
                        snap.docs.map((item) => [
                            item.ref.parent.parent?.path ?? '',
                            item.data().value as VoteValue,
                        ]),
                    ),
                    error: null,
                }),
            (error) => setSnapshot({ key, votes: new Map(), error }),
        );
    }, [uid, key, classId]);

    const current = snapshot?.key === key ? snapshot : null;

    return {
        votes: current?.votes ?? new Map<string, VoteValue>(),
        error: current?.error ?? null,
    };
}
