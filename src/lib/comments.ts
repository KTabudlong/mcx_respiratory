import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Comment } from '@/types';

// Keep in sync with the comments rules in firestore.rules.
export const MAX_COMMENT_LENGTH = 5000;
// Levels 0–4: a comment at depth 4 can't be replied to.
export const MAX_COMMENT_DEPTH = 4;

export function validateComment(body: string) {
    if (body.trim() === '') {
        return 'Write something first.';
    }

    if (body.length > MAX_COMMENT_LENGTH) {
        return `Comments must be ${MAX_COMMENT_LENGTH} characters or fewer.`;
    }

    return '';
}

export function commentDepth(comment: Pick<Comment, 'ancestorIds'>) {
    return comment.ancestorIds.length;
}

function commentsRef(classId: string, postId: string) {
    return collection(db, 'classes', classId, 'posts', postId, 'comments');
}

function commentRef(comment: Pick<Comment, 'classId' | 'postId' | 'id'>) {
    return doc(
        db,
        'classes',
        comment.classId,
        'posts',
        comment.postId,
        'comments',
        comment.id,
    );
}

// `parent` null = top-level comment.
export function createComment(
    classId: string,
    postId: string,
    userId: string,
    parent: Comment | null,
    body: string,
) {
    return addDoc(commentsRef(classId, postId), {
        userId,
        parentId: parent?.id ?? null,
        ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [],
        body: body.trim(),
        score: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });
}

export function updateComment(comment: Comment, body: string) {
    return updateDoc(commentRef(comment), {
        body: body.trim(),
        updatedAt: serverTimestamp(),
    });
}

export function softDeleteComment(comment: Comment) {
    return updateDoc(commentRef(comment), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

// Moderators only (comments.delete_any).
export function restoreComment(comment: Comment) {
    return updateDoc(commentRef(comment), {
        deletedAt: null,
        updatedAt: serverTimestamp(),
    });
}

// Firestore's COUNT(*): one read per 1,000 comments, not live.
export async function countComments(classId: string, postId: string) {
    const snap = await getCountFromServer(
        query(commentsRef(classId, postId), where('deletedAt', '==', null)),
    );

    return snap.data().count;
}
