import type { Timestamp } from 'firebase/firestore';

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

// userContacts/{uid} — private source of truth for the phone + SMS consent:
// only the owner and super admins can read it.
export type UserContact = {
    id: string;
    phone: string;
    smsOptIn: boolean;
    smsOptInAt: Timestamp | null;
    updatedAt: Timestamp;
};
