import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { deleteInvite } from '@/lib/class-invites';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import type { ClassInvite, UserProfile } from '@/types';

// Invites to existing accounts that haven't been accepted yet.
export function SentInvitesList({
    invites,
    userById,
}: {
    invites: ClassInvite[];
    userById: Map<string, UserProfile>;
}) {
    const [busyId, setBusyId] = useState('');
    const [error, setError] = useState('');

    if (invites.length === 0) {
        return null;
    }

    async function handleCancel(invite: ClassInvite) {
        setBusyId(invite.id);
        setError('');

        try {
            await deleteInvite(invite);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId('');
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invited ({invites.length})</CardTitle>
                <CardDescription>
                    They already have an account and will be asked to join next
                    time they log in.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <FormMessage message={error} />
                <ul>
                    {invites.map((invite) => {
                        const inviter = userById.get(invite.invitedBy);

                        return (
                            <li
                                key={invite.id}
                                className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium break-all">
                                        {invite.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        As {invite.roleName}
                                        {inviter &&
                                            ` · by ${inviter.firstName} ${inviter.lastName}`}{' '}
                                        ·{' '}
                                        {formatDateTime(
                                            invite.createdAt.toDate(),
                                        )}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busyId === invite.id}
                                    onClick={() => handleCancel(invite)}
                                >
                                    Cancel invite
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
