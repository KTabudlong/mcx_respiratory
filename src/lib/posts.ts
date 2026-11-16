import {
    Bytes,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import type { WriteBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { PreparedImage } from '@/lib/post-images';
import { isBlankHtml, postBodyText } from '@/lib/rich-text';
import { save, saveTimeoutFor } from '@/lib/save';
import type { Post, PostChange, PostLink } from '@/types';

// Keep in sync with hasValidContent() in firestore.rules. The body is
// editor HTML, so the limit counts tags too.
export const MAX_TITLE_LENGTH = 200;
export const MAX_BODY_LENGTH = 20000;
export const MAX_LINKS = 10;
export const MAX_LINK_LABEL_LENGTH = 80;
export const FEED_PAGE_SIZE = 20;

export type PostInput = {
    title: string;
    body: string;
    links: PostLink[];
    pinned: boolean;
};

// Feed search: `query` (already lowercase) in the title or the text.
export function postMatches(
    post: Pick<Post, 'title' | 'body' | 'format'>,
    query: string,
) {
    return (
        post.title.toLowerCase().includes(query) ||
        postBodyText(post).toLowerCase().includes(query)
    );
}

// Only http(s) links are stored or rendered, so a `javascript:` URL can never
// end up in an href. Adds https:// when the scheme is missing.
export function normalizeUrl(input: string) {
    const trimmed = input.trim();

    if (trimmed === '') {
        return null;
    }

    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    try {
        const url = new URL(withScheme);

        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.href
            : null;
    } catch {
        return null;
    }
}

export function linkLabel(link: PostLink) {
    if (link.label.trim()) {
        return link.label.trim();
    }

    try {
        return new URL(link.url).hostname.replace(/^www\./, '');
    } catch {
        return link.url;
    }
}

// Returns the cleaned input (empty link rows dropped, URLs normalized), or an
// error message.
export function preparePost(
    input: PostInput,
): { post: PostInput; error: '' } | { post: null; error: string } {
    const title = input.title.trim();

    if (title === '') {
        return { post: null, error: 'Title is required.' };
    }

    if (title.length > MAX_TITLE_LENGTH) {
        return {
            post: null,
            error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
        };
    }

    if (input.body.length > MAX_BODY_LENGTH) {
        return {
            post: null,
            error: 'The text is too long. Shorten it or split it into two posts.',
        };
    }

    const rows = input.links.filter(
        (link) => link.url.trim() !== '' || link.label.trim() !== '',
    );

    if (rows.length > MAX_LINKS) {
        return { post: null, error: `Add at most ${MAX_LINKS} links.` };
    }

    const links: PostLink[] = [];

    for (const [index, link] of rows.entries()) {
        const url = normalizeUrl(link.url);

        if (!url) {
            return {
                post: null,
                error: `Link ${index + 1} needs a valid web address (https://…).`,
            };
        }

        if (link.label.trim().length > MAX_LINK_LABEL_LENGTH) {
            return {
                post: null,
                error: `Link ${index + 1}'s label must be ${MAX_LINK_LABEL_LENGTH} characters or fewer.`,
            };
        }

        links.push({ url, label: link.label.trim() });
    }

    return {
        post: {
            title,
            body: isBlankHtml(input.body) ? '' : input.body.trim(),
            links,
            pinned: input.pinned,
        },
        error: '',
    };
}

function postRef(classId: string, postId: string) {
    return doc(db, 'classes', classId, 'posts', postId);
}

function imageRef(classId: string, postId: string, imageId: string) {
    return doc(db, 'classes', classId, 'posts', postId, 'images', imageId);
}

function addImages(
    batch: WriteBatch,
    classId: string,
    postId: string,
    userId: string,
    images: PreparedImage[],
) {
    for (const image of images) {
        batch.set(imageRef(classId, postId, image.id), {
            userId,
            type: image.type,
            data: Bytes.fromUint8Array(image.bytes),
            width: image.width,
            height: image.height,
            createdAt: serverTimestamp(),
        });
    }
}

// The post and its photos in one batch (the rules check each photo against
// the post's imageIds).
export async function createPost(
    classId: string,
    userId: string,
    post: PostInput,
    images: PreparedImage[],
) {
    const ref = doc(collection(db, 'classes', classId, 'posts'));
    const batch = writeBatch(db);

    batch.set(ref, {
        ...post,
        format: 'html',
        imageIds: images.map((image) => image.id),
        userId,
        score: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });
    addImages(batch, classId, ref.id, userId, images);
    await save(batch.commit(), saveTimeoutFor(images.length));

    return ref.id;
}

export type ImageChanges = {
    // Final gallery order (kept + new).
    imageIds: string[];
    added: PreparedImage[];
    removedIds: string[];
};

// `pinned` is only sent when it changed, since the rules require posts.pin
// for that. Removed photos are deleted outright (they're not posts).
// `userId` is the editor (author or posts.edit_any), shown as "edited by".
// Which parts an edit changes (for the history). `before` is the saved post;
// its body may be older plain text, so compare as editor HTML.
export function postChanges(
    before: Pick<Post, 'title' | 'links' | 'imageIds'> & { bodyHtml: string },
    after: PostInput,
    imageIds: string[],
) {
    const changes: PostChange[] = [];

    if (after.title.trim() !== before.title) {
        changes.push('title');
    }

    if (after.body !== before.bodyHtml.trim()) {
        changes.push('body');
    }

    if (JSON.stringify(after.links) !== JSON.stringify(before.links)) {
        changes.push('links');
    }

    if (imageIds.join('|') !== (before.imageIds ?? []).join('|')) {
        changes.push('photos');
    }

    return changes;
}

// Content edit + its history entry (edits/{n}) in one batch; the rules
// refuse an edit without the matching entry. `editCount` = the saved
// post's count (0 when never logged).
export async function updatePost(
    classId: string,
    postId: string,
    userId: string,
    post: PostInput,
    pinnedChanged: boolean,
    images: ImageChanges,
    history: { editCount: number; changes: PostChange[] },
) {
    const { pinned, ...content } = post;
    const batch = writeBatch(db);
    const editCount = history.editCount + 1;

    batch.update(postRef(classId, postId), {
        ...content,
        format: 'html',
        imageIds: images.imageIds,
        ...(pinnedChanged ? { pinned } : {}),
        editedBy: userId,
        editedAt: serverTimestamp(),
        editCount,
        updatedAt: serverTimestamp(),
    });
    batch.set(doc(postRef(classId, postId), 'edits', String(editCount)), {
        editorId: userId,
        editedAt: serverTimestamp(),
        changes: history.changes,
    });
    addImages(batch, classId, postId, userId, images.added);

    for (const id of images.removedIds) {
        batch.delete(imageRef(classId, postId, id));
    }

    await save(batch.commit(), saveTimeoutFor(images.added.length));
}

export function setPostPinned(
    classId: string,
    postId: string,
    pinned: boolean,
) {
    return save(
        updateDoc(postRef(classId, postId), {
            pinned,
            updatedAt: serverTimestamp(),
        }),
    );
}

export function softDeletePost(classId: string, postId: string) {
    return save(
        updateDoc(postRef(classId, postId), {
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }),
    );
}

// Moderators only (posts.delete_any).
export function restorePost(classId: string, postId: string) {
    return save(
        updateDoc(postRef(classId, postId), {
            deletedAt: null,
            updatedAt: serverTimestamp(),
        }),
    );
}
