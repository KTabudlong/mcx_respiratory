import {
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
    writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { ClassMember, UserContact } from '@/types';

export type ProfileInput = {
    firstName: string;
    lastName: string;
    phone: string; // E.164 or ''
    smsOptIn: boolean;
    emailOptIn: boolean;
};

// Keeps the original consent time while consent stays on.
function optInAt(
    on: boolean,
    wasOn: boolean | undefined,
    previous: UserContact['smsOptInAt'] | undefined,
) {
    if (!on) {
        return null;
    }

    return wasOn && previous ? previous : serverTimestamp();
}

// One batch: the user's profile (created on self sign-up, completed for
// invited accounts), the private contact doc, an optional join request for
// the class picked at sign-up, and the phone copy on every class membership
// so classmates see the current number.
export async function saveOwnProfile({
    uid,
    email,
    profileExists,
    contact,
    memberships,
    joinClassId,
    input,
}: {
    uid: string;
    email: string;
    profileExists: boolean;
    contact: UserContact | null;
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
        smsOptInAt: optInAt(
            input.smsOptIn,
            contact?.smsOptIn,
            contact?.smsOptInAt,
        ),
        emailOptIn: input.emailOptIn,
        emailOptInAt: optInAt(
            input.emailOptIn,
            contact?.emailOptIn,
            contact?.emailOptInAt,
        ),
        updatedAt: serverTimestamp(),
    });

    for (const membership of memberships) {
        batch.update(doc(db, 'classes', membership.classId, 'members', uid), {
            phone: input.phone,
            smsOptIn: input.smsOptIn,
            updatedAt: serverTimestamp(),
        });
    }

    if (joinClassId) {
        batch.set(doc(db, 'classes', joinClassId, 'joinRequests', uid), {
            userId: uid,
            phone: input.phone,
            smsOptIn: input.smsOptIn,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
}

// From /pending: ask to join a class after sign-up (e.g. after a rejection).
// Phone and SMS consent must match the user's contact doc (rules check it).
export function requestToJoin(
    uid: string,
    classId: string,
    contact: { phone: string; smsOptIn: boolean },
) {
    return setDoc(doc(db, 'classes', classId, 'joinRequests', uid), {
        userId: uid,
        phone: contact.phone,
        smsOptIn: contact.smsOptIn,
        createdAt: serverTimestamp(),
    });
}

export function cancelJoinRequest(uid: string, classId: string) {
    return deleteDoc(doc(db, 'classes', classId, 'joinRequests', uid));
}
