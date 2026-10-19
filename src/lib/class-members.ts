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
    writeBatch,
} from 'firebase/firestore';

import { db, firebaseConfig } from '@/lib/firebase';
import { addNotification } from '@/lib/notifications';
import type { ClassRole, JoinRequest } from '@/types';

function memberRef(classId: string, uid: string) {
    return doc(db, 'classes', classId, 'members', uid);
}

function joinRequestRef(classId: string, uid: string) {
    return doc(db, 'classes', classId, 'joinRequests', uid);
}

// Approve: create the membership (copying the phone and SMS consent from the
// request so they're there right away), delete the request and notify them,
// in one batch.
export async function approveJoinRequest(
    request: JoinRequest,
    role: ClassRole,
    approvedBy: string,
) {
    const batch = writeBatch(db);

    batch.set(memberRef(request.classId, request.userId), {
        userId: request.userId,
        roleId: role.id,
        phone: request.phone,
        smsOptIn: request.smsOptIn ?? false,
        addedBy: approvedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    batch.delete(joinRequestRef(request.classId, request.userId));
    addNotification(batch, request.userId, approvedBy, {
        type: 'added',
        classId: request.classId,
        roleName: role.name,
    });

    await batch.commit();
}

// Super admins only (they can list users and read contacts): adds an existing
// account, copying the phone and SMS consent from their contact doc. A
// pending join request for this class is cleared in the same batch.
export async function addExistingMember(
    classId: string,
    member: {
        userId: string;
        phone: string;
        smsOptIn: boolean;
    },
    role: ClassRole,
    addedBy: string,
    hasJoinRequest: boolean,
) {
    const batch = writeBatch(db);

    batch.set(memberRef(classId, member.userId), {
        ...member,
        roleId: role.id,
        addedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    if (hasJoinRequest) {
        batch.delete(joinRequestRef(classId, member.userId));
    }

    if (member.userId !== addedBy) {
        addNotification(batch, member.userId, addedBy, {
            type: 'added',
            classId,
            roleName: role.name,
        });
    }

    await batch.commit();
}

export function rejectJoinRequest(request: JoinRequest) {
    return deleteDoc(joinRequestRef(request.classId, request.userId));
}

export async function changeMemberRole(
    classId: string,
    uid: string,
    role: ClassRole,
    changedBy: string,
) {
    const batch = writeBatch(db);

    batch.update(memberRef(classId, uid), {
        roleId: role.id,
        updatedAt: serverTimestamp(),
    });
    addNotification(batch, uid, changedBy, {
        type: 'role_changed',
        classId,
        roleName: role.name,
    });

    await batch.commit();
}

// Removes them from this class only; their account and posts stay.
export async function removeMember(
    classId: string,
    uid: string,
    removedBy: string,
) {
    const batch = writeBatch(db);

    batch.delete(memberRef(classId, uid));
    addNotification(batch, uid, removedBy, {
        type: 'removed',
        classId,
        roleName: '',
    });

    await batch.commit();
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
    role: ClassRole;
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
        roleId: input.role.id,
        phone: '',
        smsOptIn: false,
        addedBy: invitedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    addNotification(batch, uid, invitedBy, {
        type: 'added',
        classId,
        roleName: input.role.name,
    });

    await batch.commit();
}
