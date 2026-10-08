import { RoleBadge } from '@/components/admin/role-badge';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
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
    Role,
    UserContact,
    UserProfile,
} from '@/types';

function RoleBadges({
    roleIds,
    roleById,
}: {
    roleIds: string[];
    roleById: Map<string, Role>;
}) {
    return roleIds.map((id) => {
        const role = roleById.get(id);

        return role ? (
            <RoleBadge key={id} role={role} />
        ) : (
            <Badge key={id} variant="outline">
                {id}
            </Badge>
        );
    });
}

export function UsersTable({
    users,
    membershipsByUser,
    emptyMessage,
    contacts,
    classes,
    roles,
    currentUserId,
    canManage,
    onEdit,
    onToggleActive,
}: {
    users: UserProfile[];
    membershipsByUser: Map<string, ClassMember[]>;
    emptyMessage: string;
    contacts: UserContact[];
    classes: ClassGroup[];
    roles: Role[];
    currentUserId: string | undefined;
    canManage: boolean;
    onEdit: (user: UserProfile) => void;
    onToggleActive: (user: UserProfile) => void;
}) {
    const phoneByUser = new Map(
        contacts.map((contact) => [contact.id, contact.phone]),
    );
    const classById = new Map(classes.map((item) => [item.id, item]));
    const roleById = new Map(roles.map((role) => [role.id, role]));

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Classes and roles</TableHead>
                        <TableHead>App-wide roles</TableHead>
                        <TableHead>Status</TableHead>
                        {canManage && (
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={canManage ? 6 : 5}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {users.map((user) => {
                        const memberships =
                            membershipsByUser.get(user.id) ?? [];
                        const status = getUserStatus(user, memberships.length);
                        const isMe = user.id === currentUserId;
                        const phone = phoneByUser.get(user.id);

                        return (
                            <TableRow
                                key={user.id}
                                className={cn(
                                    status === 'deactivated' &&
                                        'text-muted-foreground',
                                )}
                            >
                                <TableCell>
                                    <div className="font-medium">
                                        {user.lastName}, {user.firstName}
                                        {isMe && ' (you)'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {user.email}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {phone ? formatPhone(phone) : '—'}
                                </TableCell>
                                <TableCell>
                                    <ul className="grid gap-1">
                                        {memberships.map((membership) => (
                                            <li
                                                key={membership.classId}
                                                className="flex flex-wrap items-center gap-1"
                                            >
                                                <Badge variant="secondary">
                                                    {classById.get(
                                                        membership.classId,
                                                    )?.name ??
                                                        membership.classId}
                                                </Badge>
                                                <RoleBadges
                                                    roleIds={membership.roleIds}
                                                    roleById={roleById}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        <RoleBadges
                                            roleIds={user.roleIds}
                                            roleById={roleById}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <UserStatusBadge status={status} />
                                </TableCell>
                                {canManage && (
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Button
                                            size="sm"
                                            variant={
                                                status === 'pending'
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            disabled={status === 'deactivated'}
                                            onClick={() => onEdit(user)}
                                        >
                                            {status === 'pending'
                                                ? 'Approve'
                                                : 'Edit'}
                                        </Button>
                                        {!isMe && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    onToggleActive(user)
                                                }
                                            >
                                                {status === 'deactivated'
                                                    ? 'Restore'
                                                    : 'Deactivate'}
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
