import type { ClassGroup } from '@/types';

const STORAGE_KEY = 'mxc:lastClassId';

export function rememberClass(classId: string) {
    try {
        localStorage.setItem(STORAGE_KEY, classId);
    } catch {
        // Private mode / storage disabled: just don't remember.
    }
}

// The board opens the class you last switched to, else your newest active one.
export function pickStartClass(classes: ClassGroup[]) {
    let lastId: string | null = null;

    try {
        lastId = localStorage.getItem(STORAGE_KEY);
    } catch {
        lastId = null;
    }

    return (
        classes.find((item) => item.id === lastId) ??
        classes.find((item) => item.archivedAt === null) ??
        classes[0]
    );
}
