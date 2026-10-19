import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { AppNotification } from '@/types';

const RECENT = 30;

type Snapshot = { uid: string; data: AppNotification[]; error: Error | null };

// The signed-in user's newest notifications (live). Pass null to skip.
export function useNotifications(uid: string | null) {
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    useEffect(() => {
        if (!uid) {
            return;
        }

        return onSnapshot(
            query(
                collection(db, 'users', uid, 'notifications'),
                orderBy('createdAt', 'desc'),
                limit(RECENT),
            ),
            (snap) =>
                setSnapshot({
                    uid,
                    data: snap.docs.map((item) =>
                        docData<AppNotification>(item),
                    ),
                    error: null,
                }),
            (error) => setSnapshot({ uid, data: [], error }),
        );
    }, [uid]);

    const current = uid && snapshot?.uid === uid ? snapshot : null;

    return {
        data: current?.data ?? [],
        loading: uid !== null && current === null,
        error: current?.error ?? null,
    };
}
