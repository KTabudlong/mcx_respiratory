import {
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
    writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { ClassInvite, ClassRole } from '@/types';

function inviteRef(classId: string, email: string) {
    return doc(db, 'classes', classId, 'invites', email);
}

// For an account that already exists: officers can't look people up, so the
// invite is keyed by school email and the person accepts it themselves.
export function createInvite(
    classId: string,
    email: string,
    role: ClassRole,
    invitedBy: string,
) {
    const id = email.trim().toLowerCase();

    return setDoc(inviteRef(classId, id), {
        email: id,
        roleId: role.id,
        roleName: role.name,
        invitedBy,
        createdAt: serverTimestamp(),
    });
}

// Cancel (officer) or decline (invitee).
export function deleteInvite(invite: ClassInvite) {
    return deleteDoc(inviteRef(invite.classId, invite.id));
}

// The invitee joins with the invited role and their own phone / SMS consent
// (rules check both against their contact doc). Any join request they sent
// this class is cleared in the same batch.
export async function acceptInvite(
    invite: ClassInvite,
    uid: string,
    contact: { phone: string; smsOptIn: boolean },
    hasJoinRequest: boolean,
) {
    const batch = writeBatch(db);

    batch.set(doc(db, 'classes', invite.classId, 'members', uid), {
        userId: uid,
        roleId: invite.roleId,
        phone: contact.phone,
        smsOptIn: contact.smsOptIn,
        addedBy: invite.invitedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    batch.delete(inviteRef(invite.classId, invite.id));

    if (hasJoinRequest) {
        batch.delete(doc(db, 'classes', invite.classId, 'joinRequests', uid));
    }

    await batch.commit();
}
