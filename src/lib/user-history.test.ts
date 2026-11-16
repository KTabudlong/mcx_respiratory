import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import {
    buildUserHistory,
    filterUserHistory,
    historyFilterStart,
} from '@/lib/user-history';
import type { UserHistoryEvent } from '@/lib/user-history';
import type {
    AppNotification,
    ClassInvite,
    ClassMember,
    Comment,
    JoinRequest,
    Post,
    UserProfile,
} from '@/types';

function ts(ms: number) {
    return {
        toDate: () => new Date(ms),
        toMillis: () => ms,
    } as Timestamp;
}

const user = {
    id: 'u1',
    firstName: 'Sam',
    lastName: 'Student',
    email: 'sam@student.ccc.edu',
    createdBy: null,
    createdInClassId: null,
    createdAt: ts(1_000),
    updatedAt: ts(1_000),
    deletedAt: null,
} as UserProfile;

const className = (id: string) => (id === 'a' ? 'Class A' : id);
const actorName = (uid: string) => (uid === 'pres' ? 'Pat Pres' : uid);

describe('buildUserHistory', () => {
    it('sorts newest first and includes account, class, post, and comment lines', () => {
        const notifications = [
            {
                id: 'n1',
                type: 'added',
                classId: 'a',
                roleName: 'Student',
                actorId: 'pres',
                read: true,
                createdAt: ts(2_000),
            },
            {
                id: 'n2',
                type: 'removed',
                classId: 'a',
                roleName: '',
                actorId: 'pres',
                read: true,
                createdAt: ts(5_000),
            },
        ] as AppNotification[];

        const posts = [
            {
                id: 'p1',
                classId: 'a',
                userId: 'u1',
                title: 'Hello',
                body: '',
                links: [],
                pinned: false,
                createdAt: ts(3_000),
                updatedAt: ts(3_000),
                deletedAt: ts(4_000),
            },
        ] as Post[];

        const comments = [
            {
                id: 'c1',
                classId: 'a',
                postId: 'p1',
                userId: 'u1',
                parentId: null,
                ancestorIds: [],
                body: '',
                createdAt: ts(3_500),
                updatedAt: ts(4_500),
                deletedAt: ts(4_500),
            },
        ] as Comment[];

        const events = buildUserHistory({
            user,
            notifications,
            memberships: [],
            roleNameByClass: new Map(),
            joinRequests: [],
            invites: [],
            classRequest: null,
            posts,
            comments,
            className,
            actorName,
        });

        expect(events.map((event) => event.text)).toEqual([
            'Pat Pres removed them from Class A',
            'Deleted a comment in Class A',
            'Deleted post “Hello” in Class A',
            'Commented in Class A',
            'Posted “Hello” in Class A',
            'Pat Pres added them to Class A as Student',
            'Account created',
        ]);
        expect(events[1]?.comment?.id).toBe('c1');
        expect(events[2]?.restorePost?.id).toBe('p1');
        expect(events[2]?.deleted).toBe(true);
    });

    it('adds open pending items and memberships that have no add notification', () => {
        const memberships = [
            {
                id: 'u1',
                classId: 'a',
                userId: 'u1',
                roleId: 'student',
                phone: '',
                addedBy: 'pres',
                createdAt: ts(2_000),
                updatedAt: ts(2_000),
            },
        ] as ClassMember[];

        const joinRequests = [
            {
                id: 'u1',
                classId: 'b',
                userId: 'u1',
                phone: '',
                createdAt: ts(1_500),
            },
        ] as JoinRequest[];

        const invites = [
            {
                id: 'sam@student.ccc.edu',
                email: 'sam@student.ccc.edu',
                classId: 'b',
                roleId: 'student',
                roleName: 'Student',
                invitedBy: 'pres',
                createdAt: ts(1_600),
            },
        ] as ClassInvite[];

        const events = buildUserHistory({
            user,
            notifications: [],
            memberships,
            roleNameByClass: new Map([['a', 'Student']]),
            joinRequests,
            invites,
            classRequest: {
                id: 'u1',
                userId: 'u1',
                name: 'Fall cohort',
                startYear: 2026,
                endYear: null,
                note: '',
                createdAt: ts(1_200),
            },
            posts: [],
            comments: [],
            className: (id) => (id === 'a' ? 'Class A' : 'Class B'),
            actorName,
        });

        expect(events.map((event) => event.text)).toEqual([
            'Pat Pres added them to Class A as Student',
            'Invited to Class B as Student — not accepted yet',
            'Asked to join Class B',
            'Requested a new class: Fall cohort',
            'Account created',
        ]);
    });

    it('filters the timeline by date window', () => {
        const now = new Date('2026-11-16T12:00:00');
        const events = [
            { id: 'a', at: new Date('2026-11-15T10:00:00'), text: 'recent' },
            { id: 'b', at: new Date('2026-10-01T10:00:00'), text: 'older' },
            { id: 'c', at: new Date('2025-12-31T10:00:00'), text: 'last year' },
        ] as UserHistoryEvent[];

        expect(
            filterUserHistory(events, '7d', now).map((event) => event.id),
        ).toEqual(['a']);
        expect(
            filterUserHistory(events, 'year', now).map((event) => event.id),
        ).toEqual(['a', 'b']);
        expect(historyFilterStart('all', now)).toBeNull();
        expect(historyFilterStart('year', now)).toEqual(new Date(2026, 0, 1));
    });
});
