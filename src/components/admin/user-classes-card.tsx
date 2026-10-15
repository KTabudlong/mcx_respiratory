import { Link } from 'react-router';

import { RoleBadge } from '@/components/admin/role-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dates';
import type { ClassGroup, ClassMember, ClassRole, JoinRequest } from '@/types';

// The classes a user belongs to (with their role in each) and the ones
// they've asked to join.
export function UserClassesCard({
    memberships,
    requests,
    classById,
    roleByClass,
}: {
    memberships: ClassMember[];
    requests: JoinRequest[];
    classById: Map<string, ClassGroup>;
    roleByClass: Map<string, ClassRole>;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {memberships.length === 0 && requests.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Not in any class.
                    </p>
                )}
                <ul className="grid gap-2">
                    {memberships.map((membership) => {
                        const classGroup = classById.get(membership.classId);

                        return (
                            <li
                                key={membership.classId}
                                className="flex flex-wrap items-center gap-2"
                            >
                                <Link
                                    to={`/admin/classes/${membership.classId}`}
                                    className="font-medium underline-offset-4 hover:underline"
                                >
                                    {classGroup?.name ?? '…'}
                                </Link>
                                {classGroup?.archivedAt && (
                                    <Badge variant="outline">Archived</Badge>
                                )}
                                <RoleBadge
                                    role={roleByClass.get(membership.classId)}
                                />
                                <span className="text-xs text-muted-foreground">
                                    since{' '}
                                    {formatDateTime(
                                        membership.createdAt.toDate(),
                                    )}
                                </span>
                            </li>
                        );
                    })}
                    {requests.map((request) => (
                        <li
                            key={request.classId}
                            className="flex flex-wrap items-center gap-2"
                        >
                            <Link
                                to={`/admin/classes/${request.classId}/students`}
                                className="font-medium underline-offset-4 hover:underline"
                            >
                                {classById.get(request.classId)?.name ?? '…'}
                            </Link>
                            <Badge variant="secondary">
                                Join request pending
                            </Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
