import {
    collectionGroup,
    limit,
    onSnapshot,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useLoadTimeout } from '@/hooks/use-load-timeout';
import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type {
    ClassInvite,
    ClassMember,
    Comment,
    JoinRequest,
    Post,
} from '@/types';

type Snapshot<T> = { key: string; data: T[]; error: Error | null };

const ALL = '*';

// Collection-group query across every class (e.g. all classes/*/members).
// `value` is matched against `field` (only that user's docs), ALL, or null
// to skip. The class ID comes from each document's path.
function useGroupQuery<T>(
    group: string,
    value: string | null,
    field = 'userId',
) {
    const key = value ? `${group}:${field}:${value}` : null;
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

    useEffect(() => {
        if (!key || !value) {
            return;
        }

        const docs = collectionGroup(db, group);

        return onSnapshot(
            value === ALL ? docs : query(docs, where(field, '==', value)),
            (snap) =>
                setSnapshot({
                    key,
                    data: snap.docs.map((item) => docData<T>(item)),
                    error: null,
                }),
            (error) => setSnapshot({ key, data: [], error }),
        );
    }, [key, group, value, field]);

    const current = key && snapshot?.key === key ? snapshot : null;
    const timeout = useLoadTimeout(key, current === null);

    if (!key) {
        return { data: [] as T[], loading: false, error: null };
    }

    return {
        data: current?.data ?? [],
        loading: current === null && timeout === null,
        error: current?.error ?? timeout,
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

// Every class's pending join requests (super admins only). Pass false to skip.
export function useAllJoinRequests(enabled: boolean) {
    return useGroupQuery<JoinRequest>('joinRequests', enabled ? ALL : null);
}

// Every class's open invites (super admins only). Pass false to skip.
export function useAllInvites(enabled: boolean) {
    return useGroupQuery<ClassInvite>('invites', enabled ? ALL : null);
}

// Class invites sent to this school email (the signed-in user's own).
export function useInvitesFor(email: string | null) {
    return useGroupQuery<ClassInvite>(
        'invites',
        email ? email.toLowerCase() : null,
        'email',
    );
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
    const timeout = useLoadTimeout(key, current === null);

    return {
        data: current?.data ?? [],
        loading: current === null && timeout === null,
        error: current?.error ?? timeout,
    };
}

// A user's newest comments across every class, deleted ones included
// (super admins only).
export function useRecentCommentsBy(uid: string, count: number) {
    const key = `comments|${uid}|${count}`;
    const [snapshot, setSnapshot] = useState<Snapshot<Comment> | null>(null);

    useEffect(() => {
        return onSnapshot(
            query(
                collectionGroup(db, 'comments'),
                where('userId', '==', uid),
                orderBy('createdAt', 'desc'),
                limit(count),
            ),
            (snap) =>
                setSnapshot({
                    key,
                    data: snap.docs.map((item) => docData<Comment>(item)),
                    error: null,
                }),
            (error) => setSnapshot({ key, data: [], error }),
        );
    }, [key, uid, count]);

    const current = snapshot?.key === key ? snapshot : null;
    const timeout = useLoadTimeout(key, current === null);

    return {
        data: current?.data ?? [],
        loading: current === null && timeout === null,
        error: current?.error ?? timeout,
    };
}
