import { deleteApp, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    inMemoryPersistence,
    initializeAuth,
    sendPasswordResetEmail,
} from 'firebase/auth';
import {
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

import { db, firebaseConfig } from '@/lib/firebase';
import type { JoinRequest } from '@/types';

function memberRef(classId: string, uid: string) {
    return doc(db, 'classes', classId, 'members', uid);
}

function joinRequestRef(classId: string, uid: string) {
    return doc(db, 'classes', classId, 'joinRequests', uid);
}

// Approve: create the membership (copying the phone from the request so
// classmates see it right away) and delete the request, in one batch.
export async function approveJoinRequest(
    request: JoinRequest,
    roleId: string,
    approvedBy: string,
) {
    const batch = writeBatch(db);

    batch.set(memberRef(request.classId, request.userId), {
        userId: request.userId,
        roleId,
        phone: request.phone,
        addedBy: approvedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    batch.delete(joinRequestRef(request.classId, request.userId));

    await batch.commit();
}

// Super admins only (they can list users and read contacts): adds an existing
// account, copying the phone from their contact doc. A pending join request
// for this class is cleared in the same batch.
export async function addExistingMember(
    classId: string,
    member: { userId: string; roleId: string; phone: string },
    addedBy: string,
    hasJoinRequest: boolean,
) {
    const batch = writeBatch(db);

    batch.set(memberRef(classId, member.userId), {
        ...member,
        addedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    if (hasJoinRequest) {
        batch.delete(joinRequestRef(classId, member.userId));
    }

    await batch.commit();
}

export function rejectJoinRequest(request: JoinRequest) {
    return deleteDoc(joinRequestRef(request.classId, request.userId));
}

export function changeMemberRole(classId: string, uid: string, roleId: string) {
    return updateDoc(memberRef(classId, uid), {
        roleId,
        updatedAt: serverTimestamp(),
    });
}

// Removes them from this class only; their account and posts stay.
export function removeMember(classId: string, uid: string) {
    return deleteDoc(memberRef(classId, uid));
}

function randomPassword() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));

    return btoa(String.fromCharCode(...bytes));
}

// The client SDK signs in as any account it creates, so a throwaway second
// app instance creates the login and the inviter stays signed in on the main
// one. Creating someone else's login otherwise needs the Admin SDK (Blaze).
// The random password is never shown: the reset email is the student's
// "set your password" invite.
async function createLogin(email: string) {
    const app = initializeApp(firebaseConfig, `invite-${crypto.randomUUID()}`);

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

export type InviteInput = {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
};

// New account invited into a class: the login, the profile (with the
// createdBy / createdInClassId audit trail) and the membership. The phone
// stays '' until the student completes their profile.
export async function inviteToClass(
    classId: string,
    input: InviteInput,
    invitedBy: string,
) {
    const email = input.email.trim().toLowerCase();
    const uid = await createLogin(email);
    const batch = writeBatch(db);

    batch.set(doc(db, 'users', uid), {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        createdBy: invitedBy,
        createdInClassId: classId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });
    batch.set(memberRef(classId, uid), {
        userId: uid,
        roleId: input.roleId,
        phone: '',
        addedBy: invitedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await batch.commit();
}
