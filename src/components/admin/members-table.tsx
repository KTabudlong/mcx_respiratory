import { RoleBadge } from '@/components/admin/role-badge';
import { NativeSelect } from '@/components/common/native-select';
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
    onChangeRole,
    onRemove,
}: {
    rows: MemberRow[];
    assignableRoles: ClassRole[];
    currentUserId: string | undefined;
    emptyMessage: string;
    onChangeRole: (row: MemberRow, roleId: string) => void;
    onRemove: (row: MemberRow) => void;
}) {
    const showActions = rows.some((row) => row.manageable);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
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
                                colSpan={showActions ? 5 : 4}
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
                            <TableRow key={member.id}>
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
                                                onChange={(event) =>
                                                    onChangeRole(
                                                        row,
                                                        event.target.value,
                                                    )
                                                }
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
