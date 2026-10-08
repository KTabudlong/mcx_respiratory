import type { Timestamp } from 'firebase/firestore';

// users/{uid} — see the build plan § Data model.
export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    classIds: string[];
    roleIds: string[];
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};

// userContacts/{uid} — private: only the owner and users.view can read it.
export type UserContact = {
    id: string;
    phone: string;
    smsOptIn: boolean;
    smsOptInAt: Timestamp | null;
    updatedAt: Timestamp;
};
