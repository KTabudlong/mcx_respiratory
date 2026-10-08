import { Navigate, Outlet, useLocation } from 'react-router';

import { PageLoader } from '@/components/common/page-loader';
import { useAuth } from '@/hooks/use-auth';
import { hasAdminAccess } from '@/lib/permissions';

// Login / forgot-password: signed-in users go back where they came from, or
// to their home (admin panel for admins, board for everyone else).
// RequireAuth then sends unfinished or pending accounts to the right place.
export function GuestOnly() {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (user) {
        const from = (location.state as { from?: string } | null)?.from;
        const home = hasAdminAccess(profile) ? '/admin' : '/';

        return <Navigate to={from && from !== '/' ? from : home} replace />;
    }

    return <Outlet />;
}
