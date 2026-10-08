import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

type Snapshot<T> = { path: string; data: T | null; error: Error | null };

// Live listener for one document. Pass `null` to skip (e.g. signed out).
// `data` is null when the document doesn't exist.
export function useDocument<T>(path: string | null) {
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

    useEffect(() => {
        if (!path) {
            return;
        }

        return onSnapshot(
            doc(db, path),
            (snap) =>
                setSnapshot({
                    path,
                    data: snap.exists()
                        ? ({ id: snap.id, ...snap.data() } as T)
                        : null,
                    error: null,
                }),
            (error) => setSnapshot({ path, data: null, error }),
        );
    }, [path]);

    if (!path) {
        return { data: null, loading: false, error: null };
    }

    const current = snapshot?.path === path ? snapshot : null;

    return {
        data: current?.data ?? null,
        loading: current === null,
        error: current?.error ?? null,
    };
}
