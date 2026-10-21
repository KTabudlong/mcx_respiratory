import { useState } from 'react';
import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useInvitesFor, useJoinRequestsOf } from '@/hooks/use-collection-group';
import { useDocuments } from '@/hooks/use-documents';
import { acceptInvite, deleteInvite } from '@/lib/class-invites';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup, ClassInvite } from '@/types';

// Invites to join a class, sent to the signed-in user's school email.
// Accepting copies their own phone and SMS consent onto the membership.
export function ClassInvites() {
    const { user, profile, contact } = useAuth();
    const active = profile !== null && profile.deletedAt === null;
    const invites = useInvitesFor(active ? (user?.email ?? null) : null);
    const requests = useJoinRequestsOf(active ? profile.id : null);
    const classes = useDocuments<ClassGroup>(
        invites.data.map((invite) => `classes/${invite.classId}`),
    );
    const [busyId, setBusyId] = useState('');
    const [error, setError] = useState('');

    const classById = new Map(classes.data.map((item) => [item.id, item]));
    const open = invites.data.filter(
        (invite) => classById.get(invite.classId)?.archivedAt === null,
    );

    if (!active || (open.length === 0 && !invites.error)) {
        return null;
    }

    async function run(
        invite: ClassInvite,
        action: () => Promise<unknown>,
        successMessage: string,
    ) {
        setBusyId(invite.id + invite.classId);
        setError('');

        try {
            await action();
            toast.success(successMessage);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId('');
        }
    }

    return (
        <div className="grid gap-3 rounded-md border bg-background p-4 text-sm">
            <FormMessage
                message={
                    error ||
                    (invites.error ? getErrorMessage(invites.error) : '')
                }
            />
            <ul className="grid gap-3">
                {open.map((invite) => {
                    const busy = busyId === invite.id + invite.classId;
                    const className =
                        classById.get(invite.classId)?.name ?? 'the class';

                    return (
                        <li
                            key={invite.classId}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <p>
                                You're invited to join{' '}
                                <span className="font-medium">{className}</span>{' '}
                                as {invite.roleName}.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    disabled={busy}
                                    onClick={() =>
                                        run(
                                            invite,
                                            () =>
                                                acceptInvite(
                                                    invite,
                                                    profile.id,
                                                    {
                                                        phone:
                                                            contact?.phone ??
                                                            '',
                                                        smsOptIn:
                                                            contact?.smsOptIn ??
                                                            false,
                                                    },
                                                    requests.data.some(
                                                        (request) =>
                                                            request.classId ===
                                                            invite.classId,
                                                    ),
                                                ),
                                            `You joined ${className} as ${invite.roleName}.`,
                                        )
                                    }
                                >
                                    Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() =>
                                        run(
                                            invite,
                                            () => deleteInvite(invite),
                                            `Invite to ${className} declined.`,
                                        )
                                    }
                                >
                                    Decline
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
