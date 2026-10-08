import { Navigate, Outlet, useLocation } from 'react-router';

import { PageLoader } from '@/components/common/page-loader';
import { useAuth } from '@/hooks/use-auth';

// Login / forgot-password: signed-in users go back where they came from;
// RequireAuth then sends unfinished or pending accounts to the right place.
export function GuestOnly() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (user) {
        const from = (location.state as { from?: string } | null)?.from;

        return <Navigate to={from ?? '/'} replace />;
    }

    return <Outlet />;
}
