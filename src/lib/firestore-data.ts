import type { DocumentSnapshot } from 'firebase/firestore';

// Turns a snapshot into our typed shape: the document ID becomes `id`, and
// for anything under classes/{classId}/… the class ID comes from the path
// (the path is the foreign key, so it isn't stored as a field).
// serverTimestamp() fields of your own pending writes use the local estimate
// instead of null, so timestamps are always safe to format.
export function docData<T>(snap: DocumentSnapshot): T {
    const segments = snap.ref.path.split('/');
    const classId =
        segments[0] === 'classes' && segments.length > 2
            ? segments[1]
            : undefined;

    return {
        id: snap.id,
        ...(classId ? { classId } : {}),
        ...snap.data({ serverTimestamps: 'estimate' }),
    } as T;
}
