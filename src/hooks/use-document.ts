import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useLoadTimeout } from '@/hooks/use-load-timeout';
import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';

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
                    data: snap.exists() ? docData<T>(snap) : null,
                    error: null,
                }),
            (error) => setSnapshot({ path, data: null, error }),
        );
    }, [path]);

    const current = path && snapshot?.path === path ? snapshot : null;
    const timeout = useLoadTimeout(path, current === null);

    if (!path) {
        return { data: null, loading: false, error: null };
    }

    return {
        data: current?.data ?? null,
        loading: current === null && timeout === null,
        error: current?.error ?? timeout,
    };
}
