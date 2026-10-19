import { RoleBadge } from '@/components/admin/role-badge';
import { NativeSelect } from '@/components/common/native-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    addedBy: UserProfile | undefined;
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
    const showActions = rows.some((row) => row.manageable);
    const selectable = selectedIds !== undefined && onSelect !== undefined;
    const allSelected =
        rows.length > 0 &&
        rows.every((row) => selectedIds?.has(row.member.userId));
    const columns = 4 + (showActions ? 1 : 0) + (selectable ? 1 : 0);

    return (
        <div className="rounded-md border">
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
                        <TableHead>Role</TableHead>
                        <TableHead>Added by</TableHead>
                        {showActions && (
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        )}
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
                        const { member, user, role, addedBy } = row;
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
                                        {user
                                            ? `${user.lastName}, ${user.firstName}`
                                            : '…'}
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
                                <TableCell className="text-sm text-muted-foreground">
                                    {addedBy
                                        ? `${addedBy.firstName} ${addedBy.lastName}`
                                        : '—'}
                                </TableCell>
                                {showActions && (
                                    <TableCell className="text-right">
                                        {row.manageable && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onRemove(row)}
                                            >
                                                Remove
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
