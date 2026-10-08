import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type ProfileInput = {
    firstName: string;
    lastName: string;
    phone: string; // E.164 or ''
    smsOptIn: boolean;
};

// Creates (self sign-up) or completes (admin-created account) the user's
// profile and private contact doc in one batch.
export async function saveOwnProfile({
    uid,
    email,
    profileExists,
    input,
}: {
    uid: string;
    email: string;
    profileExists: boolean;
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
            classIds: [],
            roleIds: [],
            permissions: [],
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

    await batch.commit();
}
