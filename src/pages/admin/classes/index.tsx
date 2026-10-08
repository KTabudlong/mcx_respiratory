import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ClassFormDialog } from '@/components/admin/class-form-dialog';
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
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useAllMemberships } from '@/hooks/use-memberships';
import { setClassArchived } from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup, UserProfile } from '@/types';

type DialogState =
    | { type: 'form'; classGroup: ClassGroup | null }
    | { type: 'toggle-archive'; classGroup: ClassGroup }
    | null;

// Active classes first, newest first.
function sortClasses(classes: ClassGroup[]) {
    return [...classes].sort(
        (a, b) =>
            Number(a.archivedAt !== null) - Number(b.archivedAt !== null) ||
            b.startYear - a.startYear ||
            a.name.localeCompare(b.name),
    );
}

export default function AdminClasses() {
    const { can } = useAuth();
    const classes = useCollection<ClassGroup>('classes');
    // Member counts need users.view; without it the column is hidden.
    const showMembers = can('users.view');
    const users = useCollection<UserProfile>(showMembers ? 'users' : null);
    const memberships = useAllMemberships(showMembers);
    const [dialog, setDialog] = useState<DialogState>(null);

    const error = classes.error ?? users.error ?? memberships.error;
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
                        Archive old cohorts instead of deleting them.
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

            {classes.loading || users.loading || memberships.loading ? (
                <PageLoader />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Years</TableHead>
                                {showMembers && <TableHead>Members</TableHead>}
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
                                        colSpan={showMembers ? 5 : 4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No classes yet. Add your first cohort.
                                    </TableCell>
                                </TableRow>
                            )}
                            {sortClasses(classes.data).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {item.startYear}–{item.endYear ?? ''}
                                    </TableCell>
                                    {showMembers && (
                                        <TableCell>
                                            {memberCount(item.id)}
                                        </TableCell>
                                    )}
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
