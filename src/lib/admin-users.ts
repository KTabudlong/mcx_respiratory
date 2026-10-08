import { deleteApp, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    inMemoryPersistence,
    initializeAuth,
    sendPasswordResetEmail,
} from 'firebase/auth';
import type { WriteBatch } from 'firebase/firestore';
import {
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

import { db, firebaseConfig } from '@/lib/firebase';
import type { MembershipInput } from '@/lib/memberships';
import { diffMemberships } from '@/lib/memberships';
import type { ClassMember } from '@/types';

// roleIds / permissions here are app-wide; class roles go in memberships.
export type UserAdminInput = {
    firstName: string;
    lastName: string;
    roleIds: string[];
    permissions: string[];
};

function randomPassword() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));

    return btoa(String.fromCharCode(...bytes));
}

// The client SDK signs in as any account it creates, so a throwaway second
// app instance creates the login and the admin stays signed in on the main
// one. Creating someone else's login otherwise needs the Admin SDK (Blaze).
// The random password is never shown: the reset email is the student's
// "set your password" invite.
async function createLogin(email: string) {
    const app = initializeApp(
        firebaseConfig,
        `admin-create-${crypto.randomUUID()}`,
    );

    try {
        const secondaryAuth = initializeAuth(app, {
            persistence: inMemoryPersistence,
        });
        const { user } = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            randomPassword(),
        );

        await sendPasswordResetEmail(secondaryAuth, email);

        return user.uid;
    } finally {
        await deleteApp(app);
    }
}

function cleanInput(input: UserAdminInput) {
    return {
        ...input,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
    };
}

function memberRef(classId: string, uid: string) {
    return doc(db, 'classes', classId, 'members', uid);
}

// Syncs the classes/{classId}/members/{uid} pivot rows inside a batch.
function syncMemberships(
    batch: WriteBatch,
    uid: string,
    previous: ClassMember[],
    next: MembershipInput[],
) {
    const { create, update, remove } = diffMemberships(previous, next);

    for (const membership of create) {
        batch.set(memberRef(membership.classId, uid), {
            userId: uid,
            roleIds: membership.roleIds,
            permissions: membership.permissions,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    for (const membership of update) {
        batch.update(memberRef(membership.classId, uid), {
            roleIds: membership.roleIds,
            permissions: membership.permissions,
            updatedAt: serverTimestamp(),
        });
    }

    for (const membership of remove) {
        batch.delete(memberRef(membership.classId, uid));
    }
}

export async function createUserAccount(
    email: string,
    input: UserAdminInput,
    memberships: MembershipInput[],
) {
    const normalizedEmail = email.trim().toLowerCase();
    const uid = await createLogin(normalizedEmail);
    const batch = writeBatch(db);

    batch.set(doc(db, 'users', uid), {
        ...cleanInput(input),
        email: normalizedEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });
    syncMemberships(batch, uid, [], memberships);

    await batch.commit();
}

export async function updateUser(
    uid: string,
    input: UserAdminInput,
    previous: ClassMember[],
    memberships: MembershipInput[],
) {
    const batch = writeBatch(db);

    batch.update(doc(db, 'users', uid), {
        ...cleanInput(input),
        updatedAt: serverTimestamp(),
    });
    syncMemberships(batch, uid, previous, memberships);

    await batch.commit();
}

export function setUserDeactivated(uid: string, deactivated: boolean) {
    return updateDoc(doc(db, 'users', uid), {
        deletedAt: deactivated ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });
}
