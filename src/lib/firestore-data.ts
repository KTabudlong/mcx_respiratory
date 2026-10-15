import type { DocumentSnapshot } from 'firebase/firestore';

// Turns a snapshot into our typed shape: the document ID becomes `id`, and
// for anything under classes/{classId}/… the class ID comes from the path
// (the path is the foreign key, so it isn't stored as a field).
export function docData<T>(snap: DocumentSnapshot): T {
    const segments = snap.ref.path.split('/');
    const classId =
        segments[0] === 'classes' && segments.length > 2
            ? segments[1]
            : undefined;

    return {
        id: snap.id,
        ...(classId ? { classId } : {}),
        ...snap.data(),
    } as T;
}
