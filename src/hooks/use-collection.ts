import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

type Snapshot<T> = { path: string; data: T[]; error: Error | null };

// Live listener for a whole collection — fine at class size (a few hundred
// documents). Pass `null` to skip (e.g. missing permission).
export function useCollection<T>(path: string | null) {
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

    useEffect(() => {
        if (!path) {
            return;
        }

        return onSnapshot(
            collection(db, path),
            (snap) =>
                setSnapshot({
                    path,
                    data: snap.docs.map(
                        (item) => ({ id: item.id, ...item.data() }) as T,
                    ),
                    error: null,
                }),
            (error) => setSnapshot({ path, data: [], error }),
        );
    }, [path]);

    if (!path) {
        return { data: [] as T[], loading: false, error: null };
    }

    const current = snapshot?.path === path ? snapshot : null;

    return {
        data: current?.data ?? [],
        loading: current === null,
        error: current?.error ?? null,
    };
}
