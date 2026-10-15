import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';

type Snapshot<T> = {
    key: string;
    byPath: Map<string, T | null>;
    error: Error | null;
};

// Live listeners for a known list of documents (e.g. the users in a class
// roster). Firestore has no JOIN, so this is the client-side join. Missing
// documents are left out of `data`.
export function useDocuments<T>(paths: string[]) {
    const key = [...paths].sort().join('|');
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

    useEffect(() => {
        if (key === '') {
            return;
        }

        const keyPaths = key.split('|');
        const byPath = new Map<string, T | null>();

        const unsubscribes = keyPaths.map((path) =>
            onSnapshot(
                doc(db, path),
                (snap) => {
                    byPath.set(path, snap.exists() ? docData<T>(snap) : null);

                    if (byPath.size === keyPaths.length) {
                        setSnapshot({
                            key,
                            byPath: new Map(byPath),
                            error: null,
                        });
                    }
                },
                (error) => setSnapshot({ key, byPath: new Map(byPath), error }),
            ),
        );

        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, [key]);

    if (key === '') {
        return { data: [] as T[], loading: false, error: null };
    }

    // While a changed path list loads, keep showing the documents already
    // loaded so lists don't flash empty when one item is added.
    const byPath = snapshot?.byPath ?? new Map<string, T | null>();

    return {
        data: key
            .split('|')
            .map((path) => byPath.get(path))
            .filter((item): item is T => item !== null && item !== undefined),
        loading: snapshot?.key !== key,
        error: snapshot?.key === key ? snapshot.error : null,
    };
}
