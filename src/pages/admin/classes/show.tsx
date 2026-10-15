import { Navigate, useParams } from 'react-router';

import { CLASS_NAV } from '@/components/admin/admin-sidebar';
import { useAuth } from '@/hooks/use-auth';

// /admin/classes/:classId → the first class page this user's role allows.
export default function AdminClassIndex() {
    const { canIn } = useAuth();
    const { classId = '' } = useParams();
    const first = CLASS_NAV.find((item) =>
        item.anyOf.some((permission) => canIn(classId, permission)),
    );

    if (first) {
        return <Navigate to={first.path} replace />;
    }

    return (
        <p className="text-sm text-muted-foreground">
            Your role in this class opens the admin panel, but doesn't include
            any admin pages yet. Ask someone who manages roles to add
            permissions.
        </p>
    );
}
