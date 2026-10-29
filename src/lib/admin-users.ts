import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { save } from '@/lib/save';

// Super admin only: a person can be in several classes, so deactivating
// locks them out of the whole app (rules check isActive everywhere).
export function setUserDeactivated(uid: string, deactivated: boolean) {
    return save(
        updateDoc(doc(db, 'users', uid), {
            deletedAt: deactivated ? serverTimestamp() : null,
            updatedAt: serverTimestamp(),
        }),
    );
}
