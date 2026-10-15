import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { ClassMember, JoinRequest } from '@/types';

type Snapshot<T> = { key: string; data: T[]; error: Error | null };

const ALL = '*';

// Collection-group query across every class (e.g. all classes/*/members).
// `userId` is a uid (only that user's docs), ALL, or null to skip. The
// class ID comes from each document's path.
function useGroupQuery<T>(group: string, userId: string | null) {
    const key = userId ? `${group}:${userId}` : null;
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

    useEffect(() => {
        if (!key || !userId) {
            return;
        }

        const docs = collectionGroup(db, group);

        return onSnapshot(
            userId === ALL ? docs : query(docs, where('userId', '==', userId)),
            (snap) =>
                setSnapshot({
                    key,
                    data: snap.docs.map((item) => docData<T>(item)),
                    error: null,
                }),
            (error) => setSnapshot({ key, data: [], error }),
        );
    }, [key, group, userId]);

    if (!key) {
        return { data: [] as T[], loading: false, error: null };
    }

    const current = snapshot?.key === key ? snapshot : null;

    return {
        data: current?.data ?? [],
        loading: current === null,
        error: current?.error ?? null,
    };
}

// The signed-in user's classes. Pass null when signed out.
export function useMyMemberships(uid: string | null) {
    return useGroupQuery<ClassMember>('members', uid);
}

// Every membership in every class (super admins only). Pass false to skip.
export function useAllMemberships(enabled: boolean) {
    return useGroupQuery<ClassMember>('members', enabled ? ALL : null);
}

// The signed-in user's pending join requests.
export function useMyJoinRequests(uid: string | null) {
    return useGroupQuery<JoinRequest>('joinRequests', uid);
}
