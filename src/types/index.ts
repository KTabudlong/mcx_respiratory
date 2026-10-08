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

// roles/{slug} — master/reference table; permissions are keys from
// src/lib/permissions.ts.
export type Role = {
    id: string;
    name: string;
    color: string;
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// users/{uid} — see the build plan § Data model. roleIds are app-wide roles
// (they apply in every class); class roles live on ClassMember.
export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleIds: string[];
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};

// classes/{classId}/members/{uid} — the class ↔ user pivot. `id` is the uid;
// `classId` comes from the document path, not a stored field.
export type ClassMember = {
    id: string;
    classId: string;
    userId: string;
    roleIds: string[];
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// userContacts/{uid} — private: only the owner and users.view can read it.
export type UserContact = {
    id: string;
    phone: string;
    smsOptIn: boolean;
    smsOptInAt: Timestamp | null;
    updatedAt: Timestamp;
};
