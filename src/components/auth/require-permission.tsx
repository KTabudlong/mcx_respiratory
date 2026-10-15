import { Link, Outlet, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/lib/permissions';

// UI convenience only — firestore.rules enforce the same checks.

function NoAccess() {
    return (
        <div className="mx-auto flex min-h-48 max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
            <h1 className="text-xl font-semibold">No access</h1>
            <p className="text-sm text-muted-foreground">
                Your role doesn't include access to this page.
            </p>
            <Button asChild variant="outline">
                <Link to="/">Back to the board</Link>
            </Button>
        </div>
    );
}

// Super admins, or anyone whose role in some class has admin.access.
export function RequireAdminAccess() {
    const { hasAdminAccess } = useAuth();

    return hasAdminAccess ? <Outlet /> : <NoAccess />;
}

export function RequireSuperAdmin() {
    const { isSuperAdmin } = useAuth();

    return isSuperAdmin ? <Outlet /> : <NoAccess />;
}

// Board pages for :classId — members of that class (and super admins).
export function RequireClassMember() {
    const { accessIn } = useAuth();
    const { classId = '' } = useParams();
    const access = accessIn(classId);

    return access.isSuperAdmin || access.role ? <Outlet /> : <NoAccess />;
}

// Checks the signed-in user's role in the class from the :classId route
// param (always true for super admins).
export function RequireClassPermission({ anyOf }: { anyOf: Permission[] }) {
    const { canIn } = useAuth();
    const { classId = '' } = useParams();

    return anyOf.some((permission) => canIn(classId, permission)) ? (
        <Outlet />
    ) : (
        <NoAccess />
    );
}
