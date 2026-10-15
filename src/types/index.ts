import type { Bytes, Timestamp } from 'firebase/firestore';

// classes/{classId} — archived instead of deleted. Named ClassGroup because
// `class` is a reserved word.
export type ClassGroup = {
    id: string;
    name: string;
    startYear: number;
    endYear: number | null;
    archivedAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// classes/{classId}/roles/{roleId} — each class's own roles. Higher rank =
// more power; you only manage roles ranked below yours. Permissions are keys
// from src/lib/permissions.ts. `classId` comes from the document path.
export type ClassRole = {
    id: string;
    classId: string;
    name: string;
    color: string;
    rank: number;
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// classes/{classId}/members/{uid} — the class ↔ user pivot, exactly one role
// per person per class. `phone` is a copy of the member's phone so
// classmates can see it. `id` is the uid; `classId` comes from the path.
export type ClassMember = {
    id: string;
    classId: string;
    userId: string;
    roleId: string;
    phone: string;
    // Copy of userContacts.smsOptIn for "Text selected". Missing on
    // memberships created before it existed (treat as false).
    smsOptIn?: boolean;
    addedBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// classes/{classId}/joinRequests/{uid} — a pending sign-up asking to join.
export type JoinRequest = {
    id: string;
    classId: string;
    userId: string;
    phone: string;
    smsOptIn?: boolean;
    createdAt: Timestamp;
};

// classRequests/{uid} — someone asking the super admin to start a class
// (one open request per person). Approving makes them its President.
export type ClassRequest = {
    id: string;
    userId: string;
    name: string;
    startYear: number;
    endYear: number | null;
    note: string;
    createdAt: Timestamp;
};

// users/{uid} — see the build plan § Data model. createdBy is null for self
// sign-up, otherwise who invited them (and into which class).
export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdBy: string | null;
    createdInClassId: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};

// A link to a file or page kept elsewhere (Drive, OneDrive, …).
export type PostLink = { url: string; label: string };

// classes/{classId}/posts/{postId} — soft-deleted, never hard-deleted.
// `classId` comes from the path; the author's name is looked up from users.
// Older posts have no `format` (plain text) and no `imageIds`.
export type Post = {
    id: string;
    classId: string;
    userId: string;
    title: string;
    // Plain text, or sanitized-on-display HTML from the rich-text editor.
    body: string;
    format?: 'text' | 'html';
    // Gallery order; each ID is a doc in the post's images subcollection.
    imageIds?: string[];
    links: PostLink[];
    pinned: boolean;
    // Upvotes minus downvotes; missing on posts from before votes (= 0).
    score?: number;
    // Last content edit (not pins / deletes); missing until first edited.
    editedBy?: string;
    editedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};

// classes/{classId}/posts/{postId}/images/{imageId} — a photo compressed in
// the browser and stored as bytes (no Firebase Storage on the free plan).
// Hidden and restored along with its post.
export type PostImage = {
    id: string;
    classId: string;
    postId: string;
    userId: string;
    type: 'image/webp' | 'image/jpeg';
    data: Bytes;
    width: number;
    height: number;
    createdAt: Timestamp;
};

// classes/{classId}/posts/{postId}/comments/{commentId} — soft-deleted.
// `parentId` is the self foreign key (null = top-level); `ancestorIds` is the
// path from the top-level comment down to the parent. `classId` comes from
// the path; `postId` too (see docData).
export type Comment = {
    id: string;
    classId: string;
    postId: string;
    userId: string;
    parentId: string | null;
    ancestorIds: string[];
    body: string;
    // Upvotes minus downvotes; missing on comments from before votes (= 0).
    score?: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};

export type VoteValue = 1 | -1;

// <post or comment>/votes/{uid} — anonymous: only the voter can read it.
export type Vote = {
    id: string;
    userId: string;
    classId: string;
    value: VoteValue;
};

// userContacts/{uid} — private source of truth for the phone + SMS consent:
// only the owner and super admins can read it.
export type UserContact = {
    id: string;
    phone: string;
    smsOptIn: boolean;
    smsOptInAt: Timestamp | null;
    updatedAt: Timestamp;
};
