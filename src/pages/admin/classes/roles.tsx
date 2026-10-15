import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { ClassPageHeader } from '@/components/admin/class-page-header';
import { RoleBadge } from '@/components/admin/role-badge';
import { RoleFormDialog } from '@/components/admin/role-form-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
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
import { deleteRole } from '@/lib/class-roles';
import { getErrorMessage } from '@/lib/errors';
import { outranks, PERMISSIONS } from '@/lib/permissions';
import type { ClassMember, ClassRole } from '@/types';

type DialogState =
    | { type: 'form'; role: ClassRole | null }
    | { type: 'delete'; role: ClassRole }
    | null;

function permissionLabel(key: string) {
    return PERMISSIONS.find((permission) => permission.key === key)?.label;
}

// /admin/classes/:classId/roles — needs roles.manage (guarded in the router).
export default function ClassRoles() {
    const { classId = '' } = useParams();
    const { accessIn } = useAuth();
    const access = accessIn(classId);
    const roles = useCollection<ClassRole>(`classes/${classId}/roles`);
    const members = useCollection<ClassMember>(`classes/${classId}/members`);
    const [dialog, setDialog] = useState<DialogState>(null);

    const error = roles.error ?? members.error;
    const sorted = [...roles.data].sort(
        (a, b) => b.rank - a.rank || a.name.localeCompare(b.name),
    );

    function memberCount(roleId: string) {
        return members.data.filter((member) => member.roleId === roleId).length;
    }

    return (
        <div className="grid gap-4">
            <ClassPageHeader
                classId={classId}
                title="Roles"
                description="Each role's permissions apply in this class only. You can edit roles ranked below yours."
                action={
                    <Button
                        onClick={() => setDialog({ type: 'form', role: null })}
                    >
                        <Plus aria-hidden />
                        Add role
                    </Button>
                }
            />

            {error && <FormMessage message={getErrorMessage(error)} />}

            {roles.loading || members.loading ? (
                <PageLoader />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No roles yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {sorted.map((role) => {
                                const editable = outranks(access, role.rank);
                                const count = memberCount(role.id);

                                return (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <RoleBadge role={role} />
                                        </TableCell>
                                        <TableCell>{role.rank}</TableCell>
                                        <TableCell className="max-w-md whitespace-normal">
                                            {role.permissions.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    None
                                                </span>
                                            ) : (
                                                <ul className="grid gap-0.5 text-xs">
                                                    {role.permissions.map(
                                                        (key) => (
                                                            <li key={key}>
                                                                {permissionLabel(
                                                                    key,
                                                                ) ?? key}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </TableCell>
                                        <TableCell>{count}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            {editable ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setDialog({
                                                                type: 'form',
                                                                role,
                                                            })
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={count > 0}
                                                        title={
                                                            count > 0
                                                                ? 'Move its members to another role first'
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            setDialog({
                                                                type: 'delete',
                                                                role,
                                                            })
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Ranked at or above you
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {dialog?.type === 'form' && (
                <RoleFormDialog
                    classId={classId}
                    role={dialog.role}
                    access={access}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'delete' && (
                <ConfirmDialog
                    title={`Delete ${dialog.role.name}?`}
                    description="Nobody holds this role, so nothing else changes."
                    confirmLabel="Delete role"
                    destructive
                    onConfirm={() => deleteRole(classId, dialog.role.id)}
                    onClose={() => setDialog(null)}
                />
            )}
        </div>
    );
}
