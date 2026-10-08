import { Navigate, Outlet, useLocation } from 'react-router';

import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSignupStep, isApproved } from '@/lib/account-status';
import { logOut } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

// UI convenience only — firestore.rules enforce the same checks.
export function RequireAuth({
    allowPending = false,
}: {
    allowPending?: boolean;
}) {
    const {
        user,
        emailVerified,
        profile,
        contact,
        memberships,
        loading,
        error,
    } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    if (error) {
        return (
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
                <FormMessage message={getErrorMessage(error)} />
                <Button variant="outline" onClick={() => logOut()}>
                    Log out
                </Button>
            </div>
        );
    }

    const step = getSignupStep({
        signedIn: true,
        emailVerified,
        hasProfile: profile !== null,
        hasContact: contact !== null,
    });

    if (step !== 'done') {
        return <Navigate to="/signup" replace />;
    }

    if (!allowPending && !isApproved(profile, memberships.length)) {
        return <Navigate to="/pending" replace />;
    }

    return <Outlet />;
}
