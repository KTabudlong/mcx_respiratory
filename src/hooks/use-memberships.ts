import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { ClassMember } from '@/types';

type Snapshot = { key: string; data: ClassMember[]; error: Error | null };

const ALL = '*';

// Collection-group query over every classes/{classId}/members pivot.
// `key` is a uid (that user's memberships), ALL, or null to skip.
// The class ID comes from the document path (the foreign key).
function useMembersQuery(key: string | null) {
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    useEffect(() => {
        if (!key) {
            return;
        }

        const members = collectionGroup(db, 'members');

        return onSnapshot(
            key === ALL ? members : query(members, where('userId', '==', key)),
            (snap) =>
                setSnapshot({
                    key,
                    data: snap.docs.map(
                        (item) =>
                            ({
                                id: item.id,
                                classId: item.ref.parent.parent?.id ?? '',
                                ...item.data(),
                            }) as ClassMember,
                    ),
                    error: null,
                }),
            (error) => setSnapshot({ key, data: [], error }),
        );
    }, [key]);

    if (!key) {
        return { data: [] as ClassMember[], loading: false, error: null };
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
    return useMembersQuery(uid);
}

// Every membership in every class (needs users.view). Pass false to skip.
export function useAllMemberships(enabled: boolean) {
    return useMembersQuery(enabled ? ALL : null);
}
