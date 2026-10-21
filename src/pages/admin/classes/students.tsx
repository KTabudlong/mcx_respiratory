import { UserCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { AddMemberDialog } from '@/components/admin/add-member-dialog';
import { ClassPageHeader } from '@/components/admin/class-page-header';
import { InviteMemberDialog } from '@/components/admin/invite-member-dialog';
import { JoinRequestsList } from '@/components/admin/join-requests-list';
import type { MemberRow } from '@/components/admin/members-table';
import { MembersTable } from '@/components/admin/members-table';
import { SelectedMembersBar } from '@/components/admin/selected-members-bar';
import { SentInvitesList } from '@/components/admin/sent-invites-list';
import { TextSelectedDialog } from '@/components/admin/text-selected-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useDocuments } from '@/hooks/use-documents';
import { changeMemberRole, removeMember } from '@/lib/class-members';
import { uniqueEmails } from '@/lib/email';
import { getErrorMessage } from '@/lib/errors';
import {
    assignableRoles,
    defaultRole,
    hasClassPermission,
    outranks,
} from '@/lib/permissions';
import { compareByName, matchesName } from '@/lib/user-filters';
import type {
    ClassInvite,
    ClassMember,
    ClassRole,
    JoinRequest,
    UserProfile,
} from '@/types';

type DialogState =
    | { type: 'invite' }
    | { type: 'add-existing' }
    | { type: 'remove'; row: MemberRow }
    | { type: 'change-role'; row: MemberRow; role: ClassRole }
    | { type: 'text' }
    | null;

// /admin/classes/:classId/students — students.view or students.manage
// (guarded in the router). Phones come from the membership copy, which every
// classmate can read.
export default function ClassStudents() {
    const { classId = '' } = useParams();
    const { user: me, accessIn } = useAuth();
    const access = accessIn(classId);
    const canManage = hasClassPermission(access, 'students.manage');
    const canMessage = hasClassPermission(access, 'students.message');

    const members = useCollection<ClassMember>(`classes/${classId}/members`);
    const roles = useCollection<ClassRole>(`classes/${classId}/roles`);
    const requests = useCollection<JoinRequest>(
        canManage ? `classes/${classId}/joinRequests` : null,
    );
    const invites = useCollection<ClassInvite>(
        canManage ? `classes/${classId}/invites` : null,
    );
    const userIds = new Set([
        ...members.data.flatMap((member) => [member.userId, member.addedBy]),
        ...requests.data.map((request) => request.userId),
        ...invites.data.map((invite) => invite.invitedBy),
    ]);
    const users = useDocuments<UserProfile>(
        [...userIds].filter(Boolean).map((uid) => `users/${uid}`),
    );

    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dialog, setDialog] = useState<DialogState>(null);
    const [actionError, setActionError] = useState('');

    const loading =
        members.loading ||
        roles.loading ||
        requests.loading ||
        invites.loading ||
        (users.loading && users.data.length === 0);
    const error =
        members.error ??
        roles.error ??
        requests.error ??
        invites.error ??
        users.error ??
        null;

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
    // Only people still in the class (a removed member drops out).
    const selectedMembers = members.data
        .filter((member) => selectedIds.has(member.userId))
        .sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    const selectedEmails = uniqueEmails(
        selectedMembers.map(
            (member) => userById.get(member.userId)?.email ?? '',
        ),
    );
    // Texts only go to people who gave a phone and opted in.
    const textable = selectedMembers.filter(
        (member) => member.phone !== '' && member.smsOptIn === true,
    );

    function nameOf(member: ClassMember) {
        const user = userById.get(member.userId);

        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
    }

    function handleSelect(userIds: string[], selected: boolean) {
        setSelectedIds((current) => {
            const next = new Set(current);
            userIds.forEach((id) =>
                selected ? next.add(id) : next.delete(id),
            );

            return next;
        });
    }

    function handleChangeRole(row: MemberRow, roleId: string) {
        const role = roleById.get(roleId);

        if (!role || roleId === row.member.roleId) {
            return;
        }

        setActionError('');
        setDialog({ type: 'change-role', row, role });
    }

    return (
        <div className="grid gap-4">
            <ClassPageHeader
                classId={classId}
                title="Students"
                description={`${members.data.length} in this class`}
                action={
                    canManage && (
                        <div className="flex flex-wrap gap-2">
                            {access.isSuperAdmin && (
                                <Button
                                    variant="outline"
                                    disabled={assignable.length === 0}
                                    onClick={() =>
                                        setDialog({ type: 'add-existing' })
                                    }
                                >
                                    <UserCheck aria-hidden />
                                    Add existing user
                                </Button>
                            )}
                            <Button
                                disabled={assignable.length === 0}
                                onClick={() => setDialog({ type: 'invite' })}
                            >
                                <UserPlus aria-hidden />
                                Invite student
                            </Button>
                        </div>
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

                    {canManage && (
                        <SentInvitesList
                            invites={invites.data}
                            userById={userById}
                        />
                    )}

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        label="Search students by first or last name"
                    />

                    {canMessage && selectedMembers.length > 0 && (
                        <SelectedMembersBar
                            key={selectedEmails.join(',')}
                            selectedCount={selectedMembers.length}
                            emails={selectedEmails}
                            onText={() => setDialog({ type: 'text' })}
                            onClear={() => setSelectedIds(new Set())}
                        />
                    )}

                    <MembersTable
                        rows={rows}
                        assignableRoles={assignable}
                        currentUserId={me?.uid}
                        selectedIds={canMessage ? selectedIds : undefined}
                        onSelect={canMessage ? handleSelect : undefined}
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
                    memberEmails={
                        new Set(
                            members.data.map(
                                (member) =>
                                    userById
                                        .get(member.userId)
                                        ?.email.toLowerCase() ?? '',
                            ),
                        )
                    }
                    invitedEmails={
                        new Set(invites.data.map((invite) => invite.id))
                    }
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'add-existing' && me && (
                <AddMemberDialog
                    classId={classId}
                    memberIds={
                        new Set(members.data.map((member) => member.userId))
                    }
                    joinRequestIds={
                        new Set(requests.data.map((request) => request.userId))
                    }
                    roles={assignable}
                    defaultRoleId={defaultRoleId}
                    currentUserId={me.uid}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'remove' && (
                <ConfirmDialog
                    title={`Remove ${dialog.row.user?.firstName ?? 'this person'} from the class?`}
                    description="Their account and posts stay. They can request to join again."
                    confirmLabel="Remove"
                    successMessage={`${dialog.row.user?.firstName ?? 'This person'} was removed from the class.`}
                    destructive
                    onConfirm={() =>
                        removeMember(
                            classId,
                            dialog.row.member.userId,
                            me?.uid ?? '',
                        )
                    }
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'change-role' && (
                <ConfirmDialog
                    title={`Change ${dialog.row.user?.firstName ?? 'this person'}'s role to ${dialog.role.name}?`}
                    description={
                        dialog.row.role
                            ? `${dialog.row.user?.firstName ?? 'This person'} is ${dialog.row.role.name} now. Confirming gives them the ${dialog.role.name} permissions in this class.`
                            : `${dialog.row.user?.firstName ?? 'This person'} has no role right now. Confirming gives them the ${dialog.role.name} permissions in this class.`
                    }
                    confirmLabel="Change role"
                    successMessage={`${dialog.row.user?.firstName ?? 'This person'} is now ${dialog.role.name}.`}
                    onConfirm={() =>
                        changeMemberRole(
                            classId,
                            dialog.row.member.userId,
                            dialog.role,
                            me?.uid ?? '',
                        )
                    }
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'text' && (
                <TextSelectedDialog
                    recipients={textable.map((member) => ({
                        userId: member.userId,
                        name: nameOf(member),
                        phone: member.phone,
                    }))}
                    skippedNames={selectedMembers
                        .filter((member) => !textable.includes(member))
                        .map(nameOf)}
                    onClose={() => setDialog(null)}
                />
            )}
        </div>
    );
}
