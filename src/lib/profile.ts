import {
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
    writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { ClassMember } from '@/types';

export type ProfileInput = {
    firstName: string;
    lastName: string;
    phone: string; // E.164 or ''
    smsOptIn: boolean;
};

// One batch: the user's profile (created on self sign-up, completed for
// invited accounts), the private contact doc, an optional join request for
// the class picked at sign-up, and the phone copy on every class membership
// so classmates see the current number.
export async function saveOwnProfile({
    uid,
    email,
    profileExists,
    memberships,
    joinClassId,
    input,
}: {
    uid: string;
    email: string;
    profileExists: boolean;
    memberships: ClassMember[];
    joinClassId: string | null;
    input: ProfileInput;
}) {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', uid);
    const names = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        updatedAt: serverTimestamp(),
    };

    if (profileExists) {
        batch.update(userRef, names);
    } else {
        batch.set(userRef, {
            ...names,
            email: email.toLowerCase(),
            createdBy: null,
            createdInClassId: null,
            createdAt: serverTimestamp(),
            deletedAt: null,
        });
    }

    batch.set(doc(db, 'userContacts', uid), {
        phone: input.phone,
        smsOptIn: input.smsOptIn,
        smsOptInAt: input.smsOptIn ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });

    for (const membership of memberships) {
        batch.update(doc(db, 'classes', membership.classId, 'members', uid), {
            phone: input.phone,
            updatedAt: serverTimestamp(),
        });
    }

    if (joinClassId) {
        batch.set(doc(db, 'classes', joinClassId, 'joinRequests', uid), {
            userId: uid,
            phone: input.phone,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
}

// From /pending: ask to join a class after sign-up (e.g. after a rejection).
// The phone must match the user's contact doc (rules check it).
export function requestToJoin(uid: string, classId: string, phone: string) {
    return setDoc(doc(db, 'classes', classId, 'joinRequests', uid), {
        userId: uid,
        phone,
        createdAt: serverTimestamp(),
    });
}

export function cancelJoinRequest(uid: string, classId: string) {
    return deleteDoc(doc(db, 'classes', classId, 'joinRequests', uid));
}
