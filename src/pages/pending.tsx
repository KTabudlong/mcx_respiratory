import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'sonner';

import { AdminLink } from '@/components/auth/admin-link';
import { ClassPicker } from '@/components/auth/class-picker';
import { ClassInvites } from '@/components/board/class-invites';
import { ClassRequestDialog } from '@/components/board/class-request-dialog';
import { NotificationList } from '@/components/board/notification-list';
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
import { useDocument } from '@/hooks/use-document';
import { useLogOut } from '@/hooks/use-log-out';
import { useNotifications } from '@/hooks/use-notifications';
import { isApproved } from '@/lib/account-status';
import { getErrorMessage } from '@/lib/errors';
import { markNotificationsRead } from '@/lib/notifications';
import { cancelJoinRequest, requestToJoin } from '@/lib/profile';
import type { ClassGroup, ClassRequest } from '@/types';

// The profile and membership listeners are live, so this page moves on by
// itself as soon as someone approves the join request.
export default function Pending() {
    const { profile, contact, memberships, isSuperAdmin } = useAuth();
    const logOut = useLogOut();
    const deactivated = profile?.deletedAt != null;
    const requests = useJoinRequestsOf(
        profile && !deactivated ? profile.id : null,
    );
    const classes = useCollection<ClassGroup>('classes');
    const classRequest = useDocument<ClassRequest>(
        profile && !deactivated ? `classRequests/${profile.id}` : null,
    );
    const notifications = useNotifications(
        profile && !deactivated ? profile.id : null,
    );
    const unread = notifications.data.filter((item) => !item.read);
    const [requestOpen, setRequestOpen] = useState(false);
    const [classId, setClassId] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (isApproved(profile, memberships.length, isSuperAdmin)) {
        return <Navigate to="/" replace />;
    }

    const classById = new Map(classes.data.map((item) => [item.id, item]));

    async function run(action: () => Promise<unknown>, successMessage = '') {
        setBusy(true);
        setError('');

        try {
            await action();
            setClassId('');

            if (successMessage) {
                toast.success(successMessage);
            }
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
                        : requests.data.length > 0
                          ? 'Waiting for approval'
                          : 'Join a class'}
                </CardTitle>
                <CardDescription>
                    {deactivated
                        ? 'Contact your instructor if you think this is a mistake.'
                        : requests.data.length > 0
                          ? 'Someone in your class who manages students needs to approve you.'
                          : "You're not in a class yet. Ask to join one, accept an invite, or ask to start a new class."}
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
                {profile && unread.length > 0 && (
                    <div className="grid gap-2 rounded-md border p-2">
                        <NotificationList notifications={unread} />
                        <Button
                            size="sm"
                            variant="ghost"
                            className="justify-self-end"
                            onClick={() =>
                                run(() =>
                                    markNotificationsRead(
                                        profile.id,
                                        unread.map((item) => item.id),
                                    ),
                                )
                            }
                        >
                            Dismiss
                        </Button>
                    </div>
                )}
                <ClassInvites />
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
                                        run(
                                            () =>
                                                cancelJoinRequest(
                                                    request.userId,
                                                    request.classId,
                                                ),
                                            'Request cancelled.',
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

                                run(
                                    () =>
                                        requestToJoin(profile.id, classId, {
                                            phone: contact?.phone ?? '',
                                            smsOptIn:
                                                contact?.smsOptIn ?? false,
                                        }),
                                    `Request sent to ${classById.get(classId)?.name ?? 'the class'}.`,
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
                {!deactivated && profile && (
                    <div className="grid gap-2 rounded-md border p-3 text-sm">
                        <p>
                            {classRequest.data ? (
                                <>
                                    You asked to start{' '}
                                    <span className="font-medium">
                                        {classRequest.data.name}
                                    </span>
                                    . Waiting for the admin.
                                </>
                            ) : (
                                "Class not listed? Ask to start it and you'll become its President."
                            )}
                        </p>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setRequestOpen(true)}
                        >
                            {classRequest.data
                                ? 'View class request'
                                : 'Request a new class'}
                        </Button>
                    </div>
                )}
                {!deactivated && (
                    <p className="text-sm text-muted-foreground">
                        This page updates by itself once you're approved.
                    </p>
                )}
                {requestOpen && (
                    <ClassRequestDialog onClose={() => setRequestOpen(false)} />
                )}
                <AdminLink />
                {!deactivated && (
                    <Button asChild variant="outline">
                        <Link to="/profile">Profile</Link>
                    </Button>
                )}
                <Button variant="outline" onClick={() => void logOut()}>
                    Log out
                </Button>
            </CardContent>
        </Card>
    );
}
