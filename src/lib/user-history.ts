import type { Timestamp } from 'firebase/firestore';

import type {
    AppNotification,
    ClassInvite,
    ClassMember,
    ClassRequest,
    Comment,
    JoinRequest,
    Post,
    UserProfile,
} from '@/types';

export type UserHistoryEvent = {
    id: string;
    at: Date;
    text: string;
    // Live post / comment link when the event is about a post or its comments.
    href?: string;
    // Comment for the eye preview modal; deep-link opens it on the board.
    comment?: Comment;
    viewCommentHref?: string;
    // Soft-deleted post that can be restored from the timeline.
    restorePost?: Post;
    deleted?: boolean;
};

export function commentPermalink(
    classId: string,
    postId: string,
    commentId: string,
) {
    return `/classes/${classId}/posts/${postId}?comment=${commentId}`;
}

function atOf(value: Timestamp | null | undefined) {
    return value ? value.toDate() : null;
}

function classLabel(classId: string, className: (classId: string) => string) {
    return className(classId);
}

// One timeline of what this person did / what happened to them, newest first.
// Built from docs we already store (no separate audit log). Class removes
// and role changes come from their notifications; open join / invite /
// class-request rows are still pending.
export function buildUserHistory({
    user,
    notifications,
    memberships,
    roleNameByClass,
    joinRequests,
    invites,
    classRequest,
    posts,
    comments,
    className,
    actorName,
}: {
    user: UserProfile;
    notifications: AppNotification[];
    memberships: ClassMember[];
    roleNameByClass: Map<string, string>;
    joinRequests: JoinRequest[];
    invites: ClassInvite[];
    classRequest: ClassRequest | null;
    posts: Post[];
    comments: Comment[];
    className: (classId: string) => string;
    actorName: (uid: string) => string;
}): UserHistoryEvent[] {
    const events: UserHistoryEvent[] = [];
    const created = atOf(user.createdAt);

    if (created) {
        events.push({
            id: 'account-created',
            at: created,
            text: 'Account created',
        });
    }

    const deactivated = atOf(user.deletedAt);

    if (deactivated) {
        events.push({
            id: 'account-deactivated',
            at: deactivated,
            text: 'Account deactivated',
        });
    }

    const addedClassIds = new Set<string>();

    for (const notification of notifications) {
        const at = atOf(notification.createdAt);

        if (!at) {
            continue;
        }

        const name = classLabel(notification.classId, className);
        const actor = actorName(notification.actorId);

        if (notification.type === 'added') {
            addedClassIds.add(notification.classId);
            events.push({
                id: `notification-${notification.id}`,
                at,
                text: `${actor} added them to ${name} as ${notification.roleName}`,
            });
        } else if (notification.type === 'role_changed') {
            events.push({
                id: `notification-${notification.id}`,
                at,
                text: `${actor} changed their role in ${name} to ${notification.roleName}`,
            });
        } else {
            events.push({
                id: `notification-${notification.id}`,
                at,
                text: `${actor} removed them from ${name}`,
            });
        }
    }

    // Memberships from before notifications existed (or if the add notice
    // was cleared) still need a "joined" line.
    for (const membership of memberships) {
        if (addedClassIds.has(membership.classId)) {
            continue;
        }

        const at = atOf(membership.createdAt);

        if (!at) {
            continue;
        }

        const role = roleNameByClass.get(membership.classId) ?? 'a role';
        const name = classLabel(membership.classId, className);
        const adder =
            membership.addedBy === membership.userId
                ? 'They'
                : actorName(membership.addedBy);

        events.push({
            id: `membership-${membership.classId}`,
            at,
            text:
                adder === 'They'
                    ? `Joined ${name} as ${role}`
                    : `${adder} added them to ${name} as ${role}`,
        });
    }

    for (const request of joinRequests) {
        const at = atOf(request.createdAt);

        if (!at) {
            continue;
        }

        events.push({
            id: `join-${request.classId}`,
            at,
            text: `Asked to join ${classLabel(request.classId, className)}`,
        });
    }

    for (const invite of invites) {
        const at = atOf(invite.createdAt);

        if (!at) {
            continue;
        }

        events.push({
            id: `invite-${invite.classId}-${invite.id}`,
            at,
            text: `Invited to ${classLabel(invite.classId, className)} as ${invite.roleName} — not accepted yet`,
        });
    }

    if (classRequest) {
        const at = atOf(classRequest.createdAt);

        if (at) {
            events.push({
                id: `class-request-${classRequest.id}`,
                at,
                text: `Requested a new class: ${classRequest.name}`,
            });
        }
    }

    for (const post of posts) {
        const createdAt = atOf(post.createdAt);
        const href = `/classes/${post.classId}/posts/${post.id}`;

        if (createdAt) {
            events.push({
                id: `post-${post.classId}-${post.id}`,
                at: createdAt,
                text: `Posted “${post.title}” in ${classLabel(post.classId, className)}`,
                href: post.deletedAt ? undefined : href,
            });
        }

        const deletedAt = atOf(post.deletedAt);

        if (deletedAt) {
            events.push({
                id: `post-deleted-${post.classId}-${post.id}`,
                at: deletedAt,
                text: `Deleted post “${post.title}” in ${classLabel(post.classId, className)}`,
                deleted: true,
                restorePost: post,
            });
        }

        const editedAt = atOf(post.editedAt);

        if (editedAt) {
            events.push({
                id: `post-edited-${post.classId}-${post.id}`,
                at: editedAt,
                text: `Edited post “${post.title}” in ${classLabel(post.classId, className)}`,
                href: post.deletedAt ? undefined : href,
                deleted: post.deletedAt !== null,
            });
        }
    }

    for (const comment of comments) {
        const createdAt = atOf(comment.createdAt);
        const viewCommentHref = commentPermalink(
            comment.classId,
            comment.postId,
            comment.id,
        );

        if (createdAt) {
            events.push({
                id: `comment-${comment.classId}-${comment.id}`,
                at: createdAt,
                text: `Commented in ${classLabel(comment.classId, className)}`,
                href: comment.deletedAt ? undefined : viewCommentHref,
                comment,
                viewCommentHref,
                deleted: comment.deletedAt !== null,
            });
        }

        const deletedAt = atOf(comment.deletedAt);

        if (deletedAt) {
            events.push({
                id: `comment-deleted-${comment.classId}-${comment.id}`,
                at: deletedAt,
                text: `Deleted a comment in ${classLabel(comment.classId, className)}`,
                deleted: true,
                comment,
                viewCommentHref,
            });
        }
    }

    return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export const HISTORY_DATE_FILTERS = [
    { value: 'all', label: 'All time' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'year', label: 'This year' },
] as const;

export type HistoryDateFilter = (typeof HISTORY_DATE_FILTERS)[number]['value'];

// Start of the selected window (local time). Null = no cutoff.
export function historyFilterStart(
    filter: HistoryDateFilter,
    now = new Date(),
) {
    if (filter === 'all') {
        return null;
    }

    if (filter === 'year') {
        return new Date(now.getFullYear(), 0, 1);
    }

    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
    const start = new Date(now);

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    return start;
}

export function filterUserHistory(
    events: UserHistoryEvent[],
    filter: HistoryDateFilter,
    now = new Date(),
) {
    const start = historyFilterStart(filter, now);

    if (!start) {
        return events;
    }

    return events.filter((event) => event.at >= start);
}
