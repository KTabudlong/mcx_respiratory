import { useAuth } from '@/hooks/use-auth';
import { useDocuments } from '@/hooks/use-documents';
import { sortClasses } from '@/lib/classes';
import type { ClassGroup } from '@/types';

// The classes the signed-in user belongs to (active first, newest first).
export function useMyClasses() {
    const { memberships } = useAuth();
    const classes = useDocuments<ClassGroup>(
        memberships.map((membership) => `classes/${membership.classId}`),
    );

    return {
        classes: sortClasses(classes.data),
        loading: classes.loading,
        error: classes.error,
    };
}
