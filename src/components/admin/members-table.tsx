import { Check } from 'lucide-react';
import { Link } from 'react-router';

import { RoleBadge } from '@/components/admin/role-badge';
import { DeleteButton, ViewButton } from '@/components/common/action-buttons';
import { NativeSelect } from '@/components/common/native-select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatPhone } from '@/lib/phone';
import type { ClassMember, ClassRole, UserProfile } from '@/types';

export type MemberRow = {
    member: ClassMember;
    user: UserProfile | undefined;
    role: ClassRole | undefined;
    // Manager can change this person's role and remove them.
    manageable: boolean;
};

export function MembersTable({
    rows,
    assignableRoles,
    currentUserId,
    emptyMessage,
    selectedIds,
    onSelect,
    onChangeRole,
    onRemove,
}: {
    rows: MemberRow[];
    assignableRoles: ClassRole[];
    currentUserId: string | undefined;
    emptyMessage: string;
    // Selected user IDs for email / text; leave both out to hide the
    // checkbox column.
    selectedIds?: Set<string>;
    onSelect?: (userIds: string[], selected: boolean) => void;
    onChangeRole: (row: MemberRow, roleId: string) => void;
    onRemove: (row: MemberRow) => void;
}) {
    const selectable = selectedIds !== undefined && onSelect !== undefined;
    const allSelected =
        rows.length > 0 &&
        rows.every((row) => selectedIds?.has(row.member.userId));
    const columns = 5 + (selectable ? 1 : 0);

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        {selectable && (
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Select everyone shown"
                                    checked={allSelected}
                                    disabled={rows.length === 0}
                                    onCheckedChange={(checked) =>
                                        onSelect(
                                            rows.map(
                                                (row) => row.member.userId,
                                            ),
                                            checked === true,
                                        )
                                    }
                                />
                            </TableHead>
                        )}
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead
                            className="w-12 text-center"
                            title="Opted in to text messages"
                        >
                            SMS
                        </TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columns}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {rows.map((row) => {
                        const { member, user, role } = row;
                        const name = user
                            ? `${user.firstName} ${user.lastName}`
                            : 'this person';
                        const selectId = `member-role-${member.id}`;

                        return (
                            <TableRow
                                key={member.id}
                                data-state={
                                    selectedIds?.has(member.userId)
                                        ? 'selected'
                                        : undefined
                                }
                            >
                                {selectable && (
                                    <TableCell>
                                        <Checkbox
                                            aria-label={`Select ${user?.firstName ?? 'member'} ${user?.lastName ?? ''}`.trim()}
                                            checked={selectedIds.has(
                                                member.userId,
                                            )}
                                            onCheckedChange={(checked) =>
                                                onSelect(
                                                    [member.userId],
                                                    checked === true,
                                                )
                                            }
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        {user ? (
                                            <Link
                                                to={`/admin/classes/${member.classId}/students/${member.userId}`}
                                                className="underline-offset-4 hover:underline"
                                            >
                                                {user.lastName},{' '}
                                                {user.firstName}
                                            </Link>
                                        ) : (
                                            '…'
                                        )}
                                        {member.userId === currentUserId &&
                                            ' (you)'}
                                        {user?.deletedAt && (
                                            <Badge variant="outline">
                                                Deactivated
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {user?.email}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {member.phone
                                        ? formatPhone(member.phone)
                                        : '—'}
                                </TableCell>
                                <TableCell className="w-12 text-center">
                                    {member.smsOptIn && (
                                        <Check
                                            className="mx-auto size-4 text-green-600 dark:text-green-500"
                                            aria-label="Opted in to text messages"
                                            role="img"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row.manageable ? (
                                        <>
                                            <label
                                                htmlFor={selectId}
                                                className="sr-only"
                                            >
                                                Role for {user?.firstName}
                                            </label>
                                            <NativeSelect
                                                id={selectId}
                                                className="w-40"
                                                value={member.roleId}
                                                onChange={(event) => {
                                                    const nextRoleId =
                                                        event.target.value;
                                                    event.currentTarget.value =
                                                        member.roleId;

                                                    if (
                                                        nextRoleId !==
                                                        member.roleId
                                                    ) {
                                                        onChangeRole(
                                                            row,
                                                            nextRoleId,
                                                        );
                                                    }
                                                }}
                                            >
                                                {!role && (
                                                    <option
                                                        value={member.roleId}
                                                    >
                                                        Missing role
                                                    </option>
                                                )}
                                                {assignableRoles.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </>
                                    ) : (
                                        <RoleBadge role={role} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <ViewButton
                                            label={`View ${name}`}
                                            title="View"
                                            to={`/admin/classes/${member.classId}/students/${member.userId}`}
                                        />
                                        {row.manageable && (
                                            <DeleteButton
                                                label={`Remove ${name} from the class`}
                                                title="Remove from class"
                                                onClick={() => onRemove(row)}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
