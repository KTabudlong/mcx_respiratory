import type { DocumentSnapshot } from 'firebase/firestore';

// Turns a snapshot into our typed shape: the document ID becomes `id`, and
// for anything under classes/{classId}/… (and …/posts/{postId}/…) the class
// and post IDs come from the path (the path is the foreign key, so they
// aren't stored as fields).
// serverTimestamp() fields of your own pending writes use the local estimate
// instead of null, so timestamps are always safe to format.
export function docData<T>(snap: DocumentSnapshot): T {
    const segments = snap.ref.path.split('/');
    const classId =
        segments[0] === 'classes' && segments.length > 2
            ? segments[1]
            : undefined;
    const postId =
        classId && segments[2] === 'posts' && segments.length > 4
            ? segments[3]
            : undefined;

    return {
        id: snap.id,
        ...(classId ? { classId } : {}),
        ...(postId ? { postId } : {}),
        ...snap.data({ serverTimestamps: 'estimate' }),
    } as T;
}
