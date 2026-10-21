import { useState } from 'react';
import { Link } from 'react-router';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { approveClassRequest, deleteClassRequest } from '@/lib/classes';
import { formatDateTime } from '@/lib/dates';
import type { ClassRequest, UserProfile } from '@/types';

type Action = { type: 'approve' | 'reject'; request: ClassRequest } | null;

// Super admin: students asking to start a class. Approving creates it with
// the requester as President.
export function ClassRequestsCard({
    requests,
    usersById,
}: {
    requests: ClassRequest[];
    usersById: Map<string, UserProfile>;
}) {
    const { user } = useAuth();
    const [action, setAction] = useState<Action>(null);

    if (requests.length === 0) {
        return null;
    }

    function nameOf(userId: string) {
        const profile = usersById.get(userId);

        return profile ? `${profile.firstName} ${profile.lastName}` : 'Someone';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Class requests ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="grid gap-4">
                    {requests.map((request) => (
                        <li
                            key={request.id}
                            className="flex flex-wrap items-start justify-between gap-3"
                        >
                            <div className="grid min-w-0 gap-1">
                                <p className="font-medium">
                                    {request.name}{' '}
                                    <span className="font-normal text-muted-foreground">
                                        {request.startYear}–
                                        {request.endYear ?? ''}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    From{' '}
                                    <Link
                                        to={`/admin/users/${request.userId}`}
                                        className="underline-offset-4 hover:underline"
                                    >
                                        {nameOf(request.userId)}
                                    </Link>
                                    {request.createdAt &&
                                        ` · ${formatDateTime(request.createdAt.toDate())}`}
                                </p>
                                {request.note && (
                                    <p className="text-sm break-words whitespace-pre-line">
                                        {request.note}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setAction({ type: 'approve', request })
                                    }
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setAction({ type: 'reject', request })
                                    }
                                >
                                    Reject
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>

            {action?.type === 'approve' && (
                <ConfirmDialog
                    title={`Create ${action.request.name}?`}
                    description={`${nameOf(action.request.userId)} becomes its President, with every permission in the class.`}
                    confirmLabel="Create class"
                    successMessage={`${action.request.name} created. ${nameOf(action.request.userId)} is its President.`}
                    onConfirm={() =>
                        approveClassRequest(action.request, user?.uid ?? '')
                    }
                    onClose={() => setAction(null)}
                />
            )}
            {action?.type === 'reject' && (
                <ConfirmDialog
                    title={`Reject ${action.request.name}?`}
                    description="The request is removed. They can send a new one."
                    confirmLabel="Reject"
                    successMessage={`Request for ${action.request.name} rejected.`}
                    destructive
                    onConfirm={() => deleteClassRequest(action.request.id)}
                    onClose={() => setAction(null)}
                />
            )}
        </Card>
    );
}
