import {
    collection,
    doc,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import type { WriteBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { save } from '@/lib/save';
import type { AppNotification, NotificationType } from '@/types';

// Adds the notification to the batch that makes the change; the rules check
// it matches (see notificationMatches in firestore.rules).
export function addNotification(
    batch: WriteBatch,
    uid: string,
    actorId: string,
    input: { type: NotificationType; classId: string; roleName: string },
) {
    batch.set(doc(collection(db, 'users', uid, 'notifications')), {
        ...input,
        actorId,
        read: false,
        createdAt: serverTimestamp(),
    });
}

export async function markNotificationsRead(uid: string, ids: string[]) {
    const batch = writeBatch(db);

    for (const id of ids) {
        batch.update(doc(db, 'users', uid, 'notifications', id), {
            read: true,
        });
    }

    await save(batch.commit());
}

export function notificationText(
    notification: Pick<AppNotification, 'type' | 'roleName'>,
    className: string,
    actorName: string,
) {
    switch (notification.type) {
        case 'added':
            return `${actorName} added you to ${className} as ${notification.roleName}.`;
        case 'role_changed':
            return `${actorName} changed your role in ${className} to ${notification.roleName}.`;
        case 'removed':
            return `${actorName} removed you from ${className}.`;
    }
}
