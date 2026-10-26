import {
    collection,
    collectionGroup,
    getCountFromServer,
    query,
    where,
} from 'firebase/firestore';
import type { Query } from 'firebase/firestore';

import { db } from '@/lib/firebase';

// Dashboard numbers. Each is a COUNT(*) aggregation: one read per 1,000
// matching docs, fetched once (not live).
async function count(source: Query) {
    const snap = await getCountFromServer(source);

    return snap.data().count;
}

export type ClassStats = {
    members: number;
    posts: number;
    // null = the viewer's role can't see these.
    deletedPosts: number | null;
    joinRequests: number | null;
};

export async function fetchClassStats(
    classId: string,
    canSeeDeleted: boolean,
    canSeeRequests: boolean,
): Promise<ClassStats> {
    const posts = collection(db, 'classes', classId, 'posts');
    const [members, live, deletedPosts, joinRequests] = await Promise.all([
        count(collection(db, 'classes', classId, 'members')),
        count(query(posts, where('deletedAt', '==', null))),
        canSeeDeleted
            ? count(query(posts, where('deletedAt', '!=', null)))
            : null,
        canSeeRequests
            ? count(collection(db, 'classes', classId, 'joinRequests'))
            : null,
    ]);

    return { members, posts: live, deletedPosts, joinRequests };
}

export type SiteStats = {
    openClasses: number;
    joinRequests: number;
};

// Super admins only (the rules allow listing every class's join requests
// just for them). User counts come from useUserStatusCounts.
export async function fetchSiteStats(): Promise<SiteStats> {
    const [openClasses, joinRequests] = await Promise.all([
        count(
            query(collection(db, 'classes'), where('archivedAt', '==', null)),
        ),
        count(collectionGroup(db, 'joinRequests')),
    ]);

    return { openClasses, joinRequests };
}

export type UserActivity = { posts: number; comments: number };

// Everything one person has written across all classes, deleted included
// (super admins only).
export async function fetchUserActivity(userId: string): Promise<UserActivity> {
    const [posts, comments] = await Promise.all([
        count(
            query(collectionGroup(db, 'posts'), where('userId', '==', userId)),
        ),
        count(
            query(
                collectionGroup(db, 'comments'),
                where('userId', '==', userId),
            ),
        ),
    ]);

    return { posts, comments };
}
