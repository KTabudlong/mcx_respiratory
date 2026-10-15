import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { ClassPageHeader } from '@/components/admin/class-page-header';
import { InviteMemberDialog } from '@/components/admin/invite-member-dialog';
import { JoinRequestsList } from '@/components/admin/join-requests-list';
import type { MemberRow } from '@/components/admin/members-table';
import { MembersTable } from '@/components/admin/members-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useDocuments } from '@/hooks/use-documents';
import { changeMemberRole, removeMember } from '@/lib/class-members';
import { getErrorMessage } from '@/lib/errors';
import {
    assignableRoles,
    defaultRole,
    hasClassPermission,
    outranks,
} from '@/lib/permissions';
import { compareByName, matchesName } from '@/lib/user-filters';
import type { ClassMember, ClassRole, JoinRequest, UserProfile } from '@/types';

type DialogState =
    { type: 'invite' } | { type: 'remove'; row: MemberRow } | null;

// /admin/classes/:classId/students — students.view or students.manage
// (guarded in the router). Phones come from the membership copy, which every
// classmate can read.
export default function ClassStudents() {
    const { classId = '' } = useParams();
    const { user: me, accessIn } = useAuth();
    const access = accessIn(classId);
    const canManage = hasClassPermission(access, 'students.manage');

    const members = useCollection<ClassMember>(`classes/${classId}/members`);
    const roles = useCollection<ClassRole>(`classes/${classId}/roles`);
    const requests = useCollection<JoinRequest>(
        canManage ? `classes/${classId}/joinRequests` : null,
    );
    const userIds = new Set([
        ...members.data.flatMap((member) => [member.userId, member.addedBy]),
        ...requests.data.map((request) => request.userId),
    ]);
    const users = useDocuments<UserProfile>(
        [...userIds].filter(Boolean).map((uid) => `users/${uid}`),
    );

    const [search, setSearch] = useState('');
    const [dialog, setDialog] = useState<DialogState>(null);
    const [actionError, setActionError] = useState('');

    const loading =
        members.loading ||
        roles.loading ||
        requests.loading ||
        (users.loading && users.data.length === 0);
    const error =
        members.error ?? roles.error ?? requests.error ?? users.error ?? null;

    const userById = new Map(users.data.map((user) => [user.id, user]));
    const roleById = new Map(roles.data.map((role) => [role.id, role]));
    const assignable = assignableRoles(roles.data, access);
    const defaultRoleId = defaultRole(roles.data, access)?.id ?? '';

    const rows: MemberRow[] = members.data
        .map((member) => {
            const role = roleById.get(member.roleId);

            return {
                member,
                user: userById.get(member.userId),
                role,
                addedBy: userById.get(member.addedBy),
                manageable:
                    canManage &&
                    (role ? outranks(access, role.rank) : access.isSuperAdmin),
            };
        })
        .filter((row) => !row.user || matchesName(row.user, search))
        .sort((a, b) => (a.user && b.user ? compareByName(a.user, b.user) : 0));
    const sortedRequests = [...requests.data].sort(
        (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis(),
    );

    async function handleChangeRole(row: MemberRow, roleId: string) {
        setActionError('');

        try {
            await changeMemberRole(classId, row.member.userId, roleId);
        } catch (err) {
            setActionError(getErrorMessage(err));
        }
    }

    return (
        <div className="grid gap-4">
            <ClassPageHeader
                classId={classId}
                title="Students"
                description={`${members.data.length} in this class`}
                action={
                    canManage && (
                        <Button
                            disabled={assignable.length === 0}
                            onClick={() => setDialog({ type: 'invite' })}
                        >
                            <UserPlus aria-hidden />
                            Invite student
                        </Button>
                    )
                }
            />

            {error && <FormMessage message={getErrorMessage(error)} />}
            <FormMessage message={actionError} />

            {loading ? (
                <PageLoader />
            ) : (
                <>
                    {canManage && me && (
                        <JoinRequestsList
                            requests={sortedRequests}
                            userById={userById}
                            roles={assignable}
                            defaultRoleId={defaultRoleId}
                            approvedBy={me.uid}
                        />
                    )}

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        label="Search students by first or last name"
                    />

                    <MembersTable
                        rows={rows}
                        assignableRoles={assignable}
                        currentUserId={me?.uid}
                        emptyMessage={
                            members.data.length === 0
                                ? 'Nobody in this class yet.'
                                : 'No students match your search.'
                        }
                        onChangeRole={handleChangeRole}
                        onRemove={(row) => setDialog({ type: 'remove', row })}
                    />
                </>
            )}

            {dialog?.type === 'invite' && me && (
                <InviteMemberDialog
                    classId={classId}
                    roles={assignable}
                    defaultRoleId={defaultRoleId}
                    invitedBy={me.uid}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'remove' && (
                <ConfirmDialog
                    title={`Remove ${dialog.row.user?.firstName ?? 'this person'} from the class?`}
                    description="Their account and posts stay. They can request to join again."
                    confirmLabel="Remove"
                    destructive
                    onConfirm={() =>
                        removeMember(classId, dialog.row.member.userId)
                    }
                    onClose={() => setDialog(null)}
                />
            )}
        </div>
    );
}
