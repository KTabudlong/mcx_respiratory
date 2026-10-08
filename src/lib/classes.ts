import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type ClassInput = {
    name: string;
    startYear: number;
    endYear: number | null;
};

export const MIN_CLASS_YEAR = 2000;
export const MAX_CLASS_YEAR = 2100;
export const MAX_CLASS_NAME_LENGTH = 80;

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

export function createClass(input: ClassInput) {
    return addDoc(collection(db, 'classes'), {
        ...input,
        name: input.name.trim(),
        archivedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
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
