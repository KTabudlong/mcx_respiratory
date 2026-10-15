import { Navigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth';

// The dashboard arrives in Phase 5; until then super admins open the class
// list and everyone else their first class.
export default function AdminIndex() {
    const { isSuperAdmin, adminClassIds } = useAuth();

    if (isSuperAdmin) {
        return <Navigate to="/admin/classes" replace />;
    }

    if (adminClassIds.length > 0) {
        return <Navigate to={`/admin/classes/${adminClassIds[0]}`} replace />;
    }

    return (
        <p className="text-sm text-muted-foreground">
            Your role doesn't include admin tools yet.
        </p>
    );
}
