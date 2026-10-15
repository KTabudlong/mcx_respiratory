import { useState } from 'react';
import { Navigate } from 'react-router';

import { AdminLink } from '@/components/auth/admin-link';
import { ClassPicker } from '@/components/auth/class-picker';
import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useJoinRequestsOf } from '@/hooks/use-collection-group';
import { isApproved } from '@/lib/account-status';
import { logOut } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { cancelJoinRequest, requestToJoin } from '@/lib/profile';
import type { ClassGroup } from '@/types';

// The profile and membership listeners are live, so this page moves on by
// itself as soon as someone approves the join request.
export default function Pending() {
    const { profile, contact, memberships, isSuperAdmin } = useAuth();
    const deactivated = profile?.deletedAt != null;
    const requests = useJoinRequestsOf(
        profile && !deactivated ? profile.id : null,
    );
    const classes = useCollection<ClassGroup>('classes');
    const [classId, setClassId] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (isApproved(profile, memberships.length, isSuperAdmin)) {
        return <Navigate to="/" replace />;
    }

    const classById = new Map(classes.data.map((item) => [item.id, item]));

    async function run(action: () => Promise<unknown>) {
        setBusy(true);
        setError('');

        try {
            await action();
            setClassId('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

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
                        : 'Someone in your class who manages students needs to approve you.'}
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
                <FormMessage
                    message={
                        error ||
                        (requests.error ? getErrorMessage(requests.error) : '')
                    }
                />
                {!deactivated && requests.data.length > 0 && (
                    <ul className="grid gap-2">
                        {requests.data.map((request) => (
                            <li
                                key={request.classId}
                                className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm"
                            >
                                <span>
                                    Requested to join{' '}
                                    <span className="font-medium">
                                        {classById.get(request.classId)?.name ??
                                            'a class'}
                                    </span>
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() =>
                                        run(() =>
                                            cancelJoinRequest(
                                                request.userId,
                                                request.classId,
                                            ),
                                        )
                                    }
                                >
                                    Cancel
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                {!deactivated &&
                    profile &&
                    !requests.loading &&
                    requests.data.length === 0 && (
                        <form
                            className="grid gap-3"
                            onSubmit={(event) => {
                                event.preventDefault();

                                if (classId === '') {
                                    setError('Choose your class.');

                                    return;
                                }

                                run(() =>
                                    requestToJoin(profile.id, classId, {
                                        phone: contact?.phone ?? '',
                                        smsOptIn: contact?.smsOptIn ?? false,
                                    }),
                                );
                            }}
                        >
                            <ClassPicker
                                id="pending-class"
                                classes={classes.data}
                                value={classId}
                                onChange={setClassId}
                            />
                            <Button type="submit" disabled={busy}>
                                Request to join
                            </Button>
                        </form>
                    )}
                {!deactivated && (
                    <p className="text-sm text-muted-foreground">
                        This page updates by itself once you're approved.
                    </p>
                )}
                <AdminLink />
                <Button variant="outline" onClick={() => logOut()}>
                    Log out
                </Button>
            </CardContent>
        </Card>
    );
}
