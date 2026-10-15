import {
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { ClassGroup } from '@/types';

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

// The class and its default Student role in one batch.
export async function createClass(input: ClassInput) {
    const batch = writeBatch(db);
    const classRef = doc(collection(db, 'classes'));
    const { id, ...role } = DEFAULT_ROLE;

    batch.set(classRef, {
        ...input,
        name: input.name.trim(),
        archivedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'classes', classRef.id, 'roles', id), {
        ...role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return classRef.id;
}

export function updateClass(id: string, input: ClassInput) {
    return updateDoc(doc(db, 'classes', id), {
        ...input,
        name: input.name.trim(),
        updatedAt: serverTimestamp(),
    });
}

export function setClassArchived(id: string, archived: boolean) {
    return updateDoc(doc(db, 'classes', id), {
        archivedAt: archived ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });
}
