import { useState } from 'react';
import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { NativeSelect } from '@/components/common/native-select';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { approveJoinRequest, rejectJoinRequest } from '@/lib/class-members';
import { getErrorMessage } from '@/lib/errors';
import { formatPhone } from '@/lib/phone';
import type { ClassRole, JoinRequest, UserProfile } from '@/types';

function JoinRequestRow({
    request,
    user,
    roles,
    defaultRoleId,
    approvedBy,
    onError,
}: {
    request: JoinRequest;
    user: UserProfile | undefined;
    roles: ClassRole[];
    defaultRoleId: string;
    approvedBy: string;
    onError: (message: string) => void;
}) {
    const [roleId, setRoleId] = useState(defaultRoleId);
    const [busy, setBusy] = useState(false);
    const selectId = `join-role-${request.id}`;
    const role = roles.find((item) => item.id === roleId);

    const name = user ? `${user.firstName} ${user.lastName}` : 'They';

    // The row disappears as soon as the write starts (Firestore shows it
    // locally) and comes back as a new row if the server refuses, so errors
    // go to the list, which stays mounted.
    async function run(action: () => Promise<void>, successMessage: string) {
        setBusy(true);
        onError('');

        try {
            await action();
            toast.success(successMessage);
        } catch (err) {
            onError(`${name}: ${getErrorMessage(err)}`);
            setBusy(false);
        }
    }

    return (
        <li className="grid gap-2 border-b py-3 last:border-b-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="font-medium">
                        {user ? `${user.lastName}, ${user.firstName}` : '…'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.email}
                        {request.phone && ` · ${formatPhone(request.phone)}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={selectId} className="sr-only">
                        Role for {user?.firstName}
                    </label>
                    <NativeSelect
                        id={selectId}
                        className="w-40"
                        value={roleId}
                        disabled={busy || roles.length === 0}
                        onChange={(event) => setRoleId(event.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </NativeSelect>
                    <Button
                        size="sm"
                        disabled={busy || !role}
                        onClick={() =>
                            role &&
                            run(
                                () =>
                                    approveJoinRequest(
                                        request,
                                        role,
                                        approvedBy,
                                    ),
                                `${name} approved as ${role.name}.`,
                            )
                        }
                    >
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() =>
                            run(
                                () => rejectJoinRequest(request),
                                `${name}'s request was rejected.`,
                            )
                        }
                    >
                        Reject
                    </Button>
                </div>
            </div>
        </li>
    );
}

export function JoinRequestsList({
    requests,
    userById,
    roles,
    defaultRoleId,
    approvedBy,
}: {
    requests: JoinRequest[];
    userById: Map<string, UserProfile>;
    roles: ClassRole[];
    defaultRoleId: string;
    approvedBy: string;
}) {
    const [error, setError] = useState('');

    if (requests.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Waiting to join ({requests.length})</CardTitle>
                <CardDescription>
                    {roles.length === 0
                        ? 'Add a role ranked below yours before approving anyone.'
                        : 'They picked this class at sign-up. Approve with a role, or reject.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <FormMessage message={error} />
                <ul>
                    {requests.map((request) => (
                        <JoinRequestRow
                            key={request.id}
                            request={request}
                            user={userById.get(request.userId)}
                            roles={roles}
                            defaultRoleId={defaultRoleId}
                            approvedBy={approvedBy}
                            onError={setError}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
