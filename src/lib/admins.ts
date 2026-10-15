import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

// admins/{uid}: super admins promote active accounts; nobody can remove
// themselves (the rules block it), so there's always at least one.
export function makeSuperAdmin(uid: string) {
    return setDoc(doc(db, 'admins', uid), { createdAt: serverTimestamp() });
}

export function removeSuperAdmin(uid: string) {
    return deleteDoc(doc(db, 'admins', uid));
}
