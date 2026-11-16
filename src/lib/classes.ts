import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import type { WriteBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { addNotification } from '@/lib/notifications';
import { MAX_ROLE_RANK, PERMISSIONS } from '@/lib/permissions';
import { load, save } from '@/lib/save';
import type { ClassGroup, ClassRequest, UserContact } from '@/types';

export type ClassInput = {
    name: string;
    startYear: number;
    endYear: number | null;
};

export const MIN_CLASS_YEAR = 2000;
export const MAX_CLASS_YEAR = 2100;
export const MAX_CLASS_NAME_LENGTH = 80;

// Every new class starts with this role, so join requests can be approved
// right away. The class adds its other roles itself.
export const DEFAULT_ROLE = {
    id: 'student',
    name: 'Student',
    color: '#16a34a',
    rank: 1,
    permissions: ['posts.create'],
};

// Only created when a class starts with a President: the top rank and every
// permission, so they run the class from there.
export const PRESIDENT_ROLE = {
    id: 'president',
    name: 'President',
    color: '#b45309',
    rank: MAX_ROLE_RANK,
    permissions: PERMISSIONS.map((permission) => permission.key),
};

export const MAX_CLASS_REQUEST_NOTE_LENGTH = 500;

export function validateClass(input: ClassInput) {
    const name = input.name.trim();

    if (name === '') {
        return 'Class name is required.';
    }

    if (name.length > MAX_CLASS_NAME_LENGTH) {
        return `Class name must be ${MAX_CLASS_NAME_LENGTH} characters or fewer.`;
    }

    if (
        !Number.isInteger(input.startYear) ||
        input.startYear < MIN_CLASS_YEAR ||
        input.startYear > MAX_CLASS_YEAR
    ) {
        return `Start year must be between ${MIN_CLASS_YEAR} and ${MAX_CLASS_YEAR}.`;
    }

    if (
        input.endYear !== null &&
        (!Number.isInteger(input.endYear) ||
            input.endYear < input.startYear ||
            input.endYear > MAX_CLASS_YEAR)
    ) {
        return 'End year must be on or after the start year.';
    }

    return '';
}

// Active classes first, newest first.
export function sortClasses(classes: ClassGroup[]) {
    return [...classes].sort(
        (a, b) =>
            Number(a.archivedAt !== null) - Number(b.archivedAt !== null) ||
            b.startYear - a.startYear ||
            a.name.localeCompare(b.name),
    );
}

export function activeClasses(classes: ClassGroup[]) {
    return sortClasses(classes).filter((item) => item.archivedAt === null);
}

// Super admins only (they can read anyone's contact doc): the phone and SMS
// consent copied onto the President's membership.
async function contactOf(userId: string) {
    const snap = await load(getDoc(doc(db, 'userContacts', userId)));
    const contact = snap.data() as UserContact | undefined;

    return {
        phone: contact?.phone ?? '',
        smsOptIn: contact?.smsOptIn ?? false,
    };
}

// The class and its Student role, plus (optionally) a President role and
// membership, in one batch. `extra` adds more writes (e.g. closing a class
// request).
async function writeNewClass(
    input: ClassInput,
    presidentId: string | null,
    createdBy: string,
    extra?: (batch: WriteBatch) => void,
) {
    const batch = writeBatch(db);
    const classRef = doc(collection(db, 'classes'));
    const roles = presidentId ? [DEFAULT_ROLE, PRESIDENT_ROLE] : [DEFAULT_ROLE];

    batch.set(classRef, {
        name: input.name.trim(),
        startYear: input.startYear,
        endYear: input.endYear,
        archivedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    for (const { id, ...role } of roles) {
        batch.set(doc(db, 'classes', classRef.id, 'roles', id), {
            ...role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    if (presidentId) {
        batch.set(doc(db, 'classes', classRef.id, 'members', presidentId), {
            userId: presidentId,
            roleId: PRESIDENT_ROLE.id,
            ...(await contactOf(presidentId)),
            addedBy: createdBy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        if (presidentId !== createdBy) {
            addNotification(batch, presidentId, createdBy, {
                type: 'added',
                classId: classRef.id,
                roleName: PRESIDENT_ROLE.name,
            });
        }
    }

    extra?.(batch);
    await save(batch.commit());

    return classRef.id;
}

export function createClass(
    input: ClassInput,
    presidentId: string | null,
    createdBy: string,
) {
    return writeNewClass(input, presidentId, createdBy);
}

// ----- class requests -----

export function requestClass(
    uid: string,
    input: ClassInput & { note: string },
) {
    return save(
        setDoc(doc(db, 'classRequests', uid), {
            userId: uid,
            name: input.name.trim(),
            startYear: input.startYear,
            endYear: input.endYear,
            note: input.note.trim(),
            createdAt: serverTimestamp(),
        }),
    );
}

// Cancel (requester) or reject (super admin).
export function deleteClassRequest(uid: string) {
    return save(deleteDoc(doc(db, 'classRequests', uid)));
}

// Super admin: create the class with the requester as President and close
// the request, in one batch.
export function approveClassRequest(request: ClassRequest, approvedBy: string) {
    return writeNewClass(request, request.userId, approvedBy, (batch) =>
        batch.delete(doc(db, 'classRequests', request.id)),
    );
}

export function updateClass(id: string, input: ClassInput) {
    return save(
        updateDoc(doc(db, 'classes', id), {
            ...input,
            name: input.name.trim(),
            updatedAt: serverTimestamp(),
        }),
    );
}

export function setClassArchived(id: string, archived: boolean) {
    return save(
        updateDoc(doc(db, 'classes', id), {
            archivedAt: archived ? serverTimestamp() : null,
            updatedAt: serverTimestamp(),
        }),
    );
}
