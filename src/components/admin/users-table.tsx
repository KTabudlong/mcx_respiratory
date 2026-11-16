import { Link } from 'react-router';

import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { RestoreButton } from '@/components/common/action-buttons';
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
import { getUserStatus } from '@/lib/account-status';
import { formatPhone } from '@/lib/phone';
import { cn } from '@/lib/utils';
import type {
    ClassGroup,
    ClassMember,
    UserContact,
    UserProfile,
} from '@/types';

// Super admin's view of every account across all classes.
export function UsersTable({
    users,
    allUsers,
    membershipsByUser,
    superAdminIds,
    contacts,
    classes,
    currentUserId,
    emptyMessage,
    onToggleActive,
}: {
    users: UserProfile[];
    allUsers: UserProfile[];
    membershipsByUser: Map<string, ClassMember[]>;
    superAdminIds: Set<string>;
    contacts: UserContact[];
    classes: ClassGroup[];
    currentUserId: string | undefined;
    emptyMessage: string;
    onToggleActive: (user: UserProfile) => void;
}) {
    const phoneByUser = new Map(
        contacts.map((contact) => [contact.id, contact.phone]),
    );
    const classById = new Map(classes.map((item) => [item.id, item]));
    const userById = new Map(allUsers.map((user) => [user.id, user]));

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Classes</TableHead>
                        <TableHead>Invited by</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {users.map((user) => {
                        const memberships =
                            membershipsByUser.get(user.id) ?? [];
                        const isSuperAdmin = superAdminIds.has(user.id);
                        const status = getUserStatus(
                            user,
                            memberships.length,
                            isSuperAdmin,
                        );
                        const isMe = user.id === currentUserId;
                        const phone = phoneByUser.get(user.id);
                        const inviter = user.createdBy
                            ? userById.get(user.createdBy)
                            : undefined;

                        return (
                            <TableRow
                                key={user.id}
                                className={cn(
                                    status === 'deactivated' &&
                                        'text-muted-foreground',
                                )}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Link
                                            to={`/admin/users/${user.id}`}
                                            className="underline-offset-4 hover:underline"
                                        >
                                            {user.lastName}, {user.firstName}
                                        </Link>
                                        {isMe && ' (you)'}
                                        {isSuperAdmin && (
                                            <Badge>Super admin</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {user.email}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {phone ? formatPhone(phone) : '—'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {memberships.length === 0 && '—'}
                                        {memberships.map((membership) => (
                                            <Badge
                                                key={membership.classId}
                                                variant="secondary"
                                                asChild
                                            >
                                                <Link
                                                    to={`/admin/classes/${membership.classId}/students`}
                                                >
                                                    {classById.get(
                                                        membership.classId,
                                                    )?.name ??
                                                        membership.classId}
                                                </Link>
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {user.createdBy === null
                                        ? 'Signed up'
                                        : inviter
                                          ? `${inviter.firstName} ${inviter.lastName}`
                                          : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    <UserStatusBadge status={status} />
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    {!isMe &&
                                        (status === 'deactivated' ? (
                                            <RestoreButton
                                                label="Restore account"
                                                onClick={() =>
                                                    onToggleActive(user)
                                                }
                                            />
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    onToggleActive(user)
                                                }
                                            >
                                                Deactivate
                                            </Button>
                                        ))}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
