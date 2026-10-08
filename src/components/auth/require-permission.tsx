import { Link, Outlet } from 'react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/lib/permissions';

// UI convenience only — firestore.rules enforce the same checks.
export function RequirePermission({ anyOf }: { anyOf: Permission[] }) {
    const { can } = useAuth();

    if (anyOf.some((permission) => can(permission))) {
        return <Outlet />;
    }

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
