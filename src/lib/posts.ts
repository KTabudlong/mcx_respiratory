import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { PostLink } from '@/types';

// Keep in sync with hasValidContent() in firestore.rules.
export const MAX_TITLE_LENGTH = 200;
export const MAX_BODY_LENGTH = 10000;
export const MAX_LINKS = 10;
export const MAX_LINK_LABEL_LENGTH = 80;
export const FEED_PAGE_SIZE = 20;

export type PostInput = {
    title: string;
    body: string;
    links: PostLink[];
    pinned: boolean;
};

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
            error: `Text must be ${MAX_BODY_LENGTH} characters or fewer.`,
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
        post: { title, body: input.body.trim(), links, pinned: input.pinned },
        error: '',
    };
}

function postRef(classId: string, postId: string) {
    return doc(db, 'classes', classId, 'posts', postId);
}

export async function createPost(
    classId: string,
    userId: string,
    post: PostInput,
) {
    const ref = await addDoc(collection(db, 'classes', classId, 'posts'), {
        ...post,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });

    return ref.id;
}

// `pinned` is only sent when it changed, since the rules require posts.pin
// for that.
export function updatePost(
    classId: string,
    postId: string,
    post: PostInput,
    pinnedChanged: boolean,
) {
    const { pinned, ...content } = post;

    return updateDoc(postRef(classId, postId), {
        ...content,
        ...(pinnedChanged ? { pinned } : {}),
        updatedAt: serverTimestamp(),
    });
}

export function setPostPinned(
    classId: string,
    postId: string,
    pinned: boolean,
) {
    return updateDoc(postRef(classId, postId), {
        pinned,
        updatedAt: serverTimestamp(),
    });
}

export function softDeletePost(classId: string, postId: string) {
    return updateDoc(postRef(classId, postId), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

// Moderators only (posts.delete_any).
export function restorePost(classId: string, postId: string) {
    return updateDoc(postRef(classId, postId), {
        deletedAt: null,
        updatedAt: serverTimestamp(),
    });
}
