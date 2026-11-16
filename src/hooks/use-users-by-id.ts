import { useDocuments } from '@/hooks/use-documents';
import type { UserProfile } from '@/types';

// Client-side join: listens to each distinct user once and returns a
// uid → profile map (e.g. post authors).
export function useUsersById(userIds: string[]) {
    const users = useDocuments<UserProfile>(
        [...new Set(userIds)].map((uid) => `users/${uid}`),
    );

    return new Map(users.data.map((user) => [user.id, user]));
}
