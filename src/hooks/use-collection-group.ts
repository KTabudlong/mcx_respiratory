import {
    collectionGroup,
    limit,
    onSnapshot,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { ClassMember, JoinRequest, Post } from '@/types';

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

// One user's classes (their own, or anyone's for super admins). Pass null
// to skip (e.g. signed out).
export function useMembershipsOf(uid: string | null) {
    return useGroupQuery<ClassMember>('members', uid);
}

// Every membership in every class (super admins only). Pass false to skip.
export function useAllMemberships(enabled: boolean) {
    return useGroupQuery<ClassMember>('members', enabled ? ALL : null);
}

// One user's pending join requests (own, or anyone's for super admins).
export function useJoinRequestsOf(uid: string | null) {
    return useGroupQuery<JoinRequest>('joinRequests', uid);
}

// A user's newest posts across every class, deleted ones included (super
// admins only).
export function useRecentPostsBy(uid: string, count: number) {
    const key = `${uid}|${count}`;
    const [snapshot, setSnapshot] = useState<Snapshot<Post> | null>(null);

    useEffect(() => {
        return onSnapshot(
            query(
                collectionGroup(db, 'posts'),
                where('userId', '==', uid),
                orderBy('createdAt', 'desc'),
                limit(count),
            ),
            (snap) =>
                setSnapshot({
                    key,
                    data: snap.docs.map((item) => docData<Post>(item)),
                    error: null,
                }),
            (error) => setSnapshot({ key, data: [], error }),
        );
    }, [key, uid, count]);

    const current = snapshot?.key === key ? snapshot : null;

    return {
        data: current?.data ?? [],
        loading: current === null,
        error: current?.error ?? null,
    };
}
