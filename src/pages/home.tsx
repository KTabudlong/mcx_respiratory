import { Navigate } from 'react-router';

import { AdminLink } from '@/components/auth/admin-link';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useMyClasses } from '@/hooks/use-my-classes';
import { getErrorMessage } from '@/lib/errors';
import { pickStartClass } from '@/lib/last-class';

// `/` opens the class you last switched to (or your newest one).
export default function Home() {
    const { classes, loading, error } = useMyClasses();

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <FormMessage message={getErrorMessage(error)} />;
    }

    const start = pickStartClass(classes);

    if (start) {
        return <Navigate to={`/classes/${start.id}`} replace />;
    }

    // Only super admins get here without a class (everyone else is pending).
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>You're not in a class yet</CardTitle>
                <CardDescription>
                    Open a class in the admin panel and use “Add existing user”
                    to add yourself, then come back to the board.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminLink />
            </CardContent>
        </Card>
    );
}
