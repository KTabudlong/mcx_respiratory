import { Navigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { isApproved } from '@/lib/account-status';
import { logOut } from '@/lib/auth';

// The profile listener is live, so this page moves on by itself as soon as
// an admin assigns a class.
export default function Pending() {
    const { profile } = useAuth();

    if (isApproved(profile)) {
        return <Navigate to="/" replace />;
    }

    const deactivated = profile?.deletedAt != null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    {deactivated
                        ? 'Account deactivated'
                        : 'Waiting for approval'}
                </CardTitle>
                <CardDescription>
                    {deactivated
                        ? 'Contact your instructor if you think this is a mistake.'
                        : 'An instructor or admin needs to add you to your class.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {profile && (
                    <p className="text-sm">
                        Signed in as{' '}
                        <span className="font-medium">
                            {profile.firstName} {profile.lastName}
                        </span>{' '}
                        <span className="break-all text-muted-foreground">
                            ({profile.email})
                        </span>
                    </p>
                )}
                {!deactivated && (
                    <p className="text-sm text-muted-foreground">
                        This page updates by itself once you're approved.
                    </p>
                )}
                <Button variant="outline" onClick={() => logOut()}>
                    Log out
                </Button>
            </CardContent>
        </Card>
    );
}
