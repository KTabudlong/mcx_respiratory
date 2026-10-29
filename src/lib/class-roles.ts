import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { MAX_ROLE_RANK, MIN_ROLE_RANK } from '@/lib/permissions';
import { save } from '@/lib/save';

export type RoleInput = {
    name: string;
    color: string;
    rank: number;
    permissions: string[];
};

export const MAX_ROLE_NAME_LENGTH = 40;

// `maxRank` = the editor's own rank: new or edited roles must rank below it.
export function validateRole(input: RoleInput, maxRank: number) {
    const name = input.name.trim();

    if (name === '') {
        return 'Role name is required.';
    }

    if (name.length > MAX_ROLE_NAME_LENGTH) {
        return `Role name must be ${MAX_ROLE_NAME_LENGTH} characters or fewer.`;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) {
        return 'Pick a color.';
    }

    if (
        !Number.isInteger(input.rank) ||
        input.rank < MIN_ROLE_RANK ||
        input.rank > MAX_ROLE_RANK
    ) {
        return `Rank must be a whole number from ${MIN_ROLE_RANK} to ${MAX_ROLE_RANK}.`;
    }

    if (input.rank >= maxRank) {
        return `Rank must be below your own role's rank (${maxRank}).`;
    }

    return '';
}

function rolesPath(classId: string) {
    return collection(db, 'classes', classId, 'roles');
}

export function createRole(classId: string, input: RoleInput) {
    return save(
        addDoc(rolesPath(classId), {
            ...input,
            name: input.name.trim(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }),
    );
}

export function updateRole(classId: string, roleId: string, input: RoleInput) {
    return save(
        updateDoc(doc(db, 'classes', classId, 'roles', roleId), {
            ...input,
            name: input.name.trim(),
            updatedAt: serverTimestamp(),
        }),
    );
}

export function deleteRole(classId: string, roleId: string) {
    return save(deleteDoc(doc(db, 'classes', classId, 'roles', roleId)));
}
