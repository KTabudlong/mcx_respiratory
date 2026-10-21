import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { ClassFormDialog } from '@/components/admin/class-form-dialog';
import { ClassRequestsCard } from '@/components/admin/class-requests-card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCollection } from '@/hooks/use-collection';
import { useAllMemberships } from '@/hooks/use-collection-group';
import { setClassArchived, sortClasses } from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup, ClassRequest, UserProfile } from '@/types';

type DialogState =
    | { type: 'form'; classGroup: ClassGroup | null }
    | { type: 'toggle-archive'; classGroup: ClassGroup }
    | null;

// Super admin only (guarded in the router).
export default function AdminClasses() {
    const classes = useCollection<ClassGroup>('classes');
    const users = useCollection<UserProfile>('users');
    const requests = useCollection<ClassRequest>('classRequests');
    const memberships = useAllMemberships(true);
    const [dialog, setDialog] = useState<DialogState>(null);

    const error =
        classes.error ?? users.error ?? requests.error ?? memberships.error;
    const usersById = new Map(users.data.map((user) => [user.id, user]));
    const deactivatedIds = new Set(
        users.data
            .filter((user) => user.deletedAt !== null)
            .map((user) => user.id),
    );

    function memberCount(classId: string) {
        return memberships.data.filter(
            (membership) =>
                membership.classId === classId &&
                !deactivatedIds.has(membership.userId),
        ).length;
    }

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Classes</h1>
                    <p className="text-sm text-muted-foreground">
                        New classes start with a Student role (and a President
                        role if you pick one). Archive old cohorts instead of
                        deleting them.
                    </p>
                </div>
                <Button
                    onClick={() =>
                        setDialog({ type: 'form', classGroup: null })
                    }
                >
                    <Plus aria-hidden />
                    Add class
                </Button>
            </div>

            {error && <FormMessage message={getErrorMessage(error)} />}

            <ClassRequestsCard
                requests={[...requests.data].sort(
                    (a, b) =>
                        (a.createdAt?.toMillis() ?? 0) -
                        (b.createdAt?.toMillis() ?? 0),
                )}
                usersById={usersById}
            />

            {classes.loading || users.loading || memberships.loading ? (
                <PageLoader />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Years</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No classes yet. Add your first cohort.
                                    </TableCell>
                                </TableRow>
                            )}
                            {sortClasses(classes.data).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            to={`/admin/classes/${item.id}`}
                                            className="underline-offset-4 hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {item.startYear}–{item.endYear ?? ''}
                                    </TableCell>
                                    <TableCell>
                                        {memberCount(item.id)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.archivedAt === null
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {item.archivedAt === null
                                                ? 'Active'
                                                : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setDialog({
                                                    type: 'form',
                                                    classGroup: item,
                                                })
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setDialog({
                                                    type: 'toggle-archive',
                                                    classGroup: item,
                                                })
                                            }
                                        >
                                            {item.archivedAt === null
                                                ? 'Archive'
                                                : 'Unarchive'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {dialog?.type === 'form' && (
                <ClassFormDialog
                    classGroup={dialog.classGroup}
                    users={users.data}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'toggle-archive' && (
                <ConfirmDialog
                    title={`${dialog.classGroup.archivedAt === null ? 'Archive' : 'Unarchive'} ${dialog.classGroup.name}?`}
                    description={
                        dialog.classGroup.archivedAt === null
                            ? 'It disappears from the class lists for new assignments. Members and posts stay.'
                            : 'It becomes available for assignments again.'
                    }
                    confirmLabel={
                        dialog.classGroup.archivedAt === null
                            ? 'Archive'
                            : 'Unarchive'
                    }
                    successMessage={`${dialog.classGroup.name} ${dialog.classGroup.archivedAt === null ? 'archived' : 'unarchived'}.`}
                    onConfirm={() =>
                        setClassArchived(
                            dialog.classGroup.id,
                            dialog.classGroup.archivedAt === null,
                        )
                    }
                    onClose={() => setDialog(null)}
                />
            )}
        </div>
    );
}
