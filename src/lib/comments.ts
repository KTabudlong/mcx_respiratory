import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    getDoc,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { load, save } from '@/lib/save';
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
    return save(
        addDoc(commentsRef(classId, postId), {
            userId,
            parentId: parent?.id ?? null,
            ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [],
            body: body.trim(),
            score: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null,
        }),
    );
}

export function updateComment(comment: Comment, body: string) {
    return save(
        updateDoc(commentRef(comment), {
            body: body.trim(),
            updatedAt: serverTimestamp(),
        }),
    );
}

export function commentArchiveRef(
    comment: Pick<Comment, 'classId' | 'postId' | 'id'>,
) {
    return doc(commentRef(comment), 'archive', 'body');
}

// A deleted comment is a "[deleted]" tombstone everyone can see: its text
// moves to archive/body (author and moderators only) in the same batch.
export async function softDeleteComment(comment: Comment) {
    const batch = writeBatch(db);

    batch.set(commentArchiveRef(comment), { body: comment.body });
    batch.update(commentRef(comment), {
        body: '',
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await save(batch.commit());
}

// Moderators only (comments.delete_any). Tombstones get their text back
// from the archive; comments deleted before tombstones still hold theirs.
export async function restoreComment(comment: Comment) {
    if (comment.body !== '') {
        await save(
            updateDoc(commentRef(comment), {
                deletedAt: null,
                updatedAt: serverTimestamp(),
            }),
        );

        return;
    }

    const archive = await load(getDoc(commentArchiveRef(comment)));
    const body = archive.data()?.body;

    if (typeof body !== 'string') {
        throw new Error(
            "This comment's text wasn't found, so it can't be restored.",
        );
    }

    const batch = writeBatch(db);

    batch.update(commentRef(comment), {
        body,
        deletedAt: null,
        updatedAt: serverTimestamp(),
    });
    batch.delete(commentArchiveRef(comment));

    await save(batch.commit());
}

// Firestore's COUNT(*): one read per 1,000 comments, not live.
export async function countComments(classId: string, postId: string) {
    const snap = await load(
        getCountFromServer(
            query(commentsRef(classId, postId), where('deletedAt', '==', null)),
        ),
    );

    return snap.data().count;
}
