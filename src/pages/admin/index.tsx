import { Navigate } from 'react-router';

import { ADMIN_NAV } from '@/components/admin/admin-sidebar';
import { useAuth } from '@/hooks/use-auth';

// The dashboard arrives in Phase 5; until then open the first allowed section.
export default function AdminIndex() {
    const { can } = useAuth();
    const first = ADMIN_NAV.find((item) => can(item.permission));

    if (first) {
        return <Navigate to={first.to} replace />;
    }

    return (
        <p className="text-sm text-muted-foreground">
            Moderation tools for your role arrive in a later update.
        </p>
    );
}
