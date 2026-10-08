import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { UsersTable } from '@/components/admin/users-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useAllMemberships } from '@/hooks/use-memberships';
import type { UserStatus } from '@/lib/account-status';
import { getUserStatus } from '@/lib/account-status';
import { setUserDeactivated } from '@/lib/admin-users';
import { getErrorMessage } from '@/lib/errors';
import { groupMembershipsByUser } from '@/lib/memberships';
import { filterUsers } from '@/lib/user-filters';
import type { ClassGroup, Role, UserContact, UserProfile } from '@/types';

const STATUS_FILTERS: { value: UserStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'deactivated', label: 'Deactivated' },
];

type DialogState =
    | { type: 'form'; user: UserProfile | null }
    | { type: 'toggle-active'; user: UserProfile }
    | null;

export default function AdminUsers() {
    const { profile: me, can } = useAuth();
    const users = useCollection<UserProfile>('users');
    const memberships = useAllMemberships(true);
    const contacts = useCollection<UserContact>('userContacts');
    const classes = useCollection<ClassGroup>('classes');
    const roles = useCollection<Role>('roles');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<UserStatus | 'all'>('all');
    const [dialog, setDialog] = useState<DialogState>(null);

    const canManage = can('users.manage');
    const loading =
        users.loading ||
        memberships.loading ||
        contacts.loading ||
        classes.loading ||
        roles.loading;
    const error =
        users.error ??
        memberships.error ??
        contacts.error ??
        classes.error ??
        roles.error;

    const membershipsByUser = groupMembershipsByUser(memberships.data);
    const classCountByUser = new Map(
        [...membershipsByUser].map(([uid, list]) => [uid, list.length]),
    );
    const pendingCount = users.data.filter(
        (user) =>
            getUserStatus(user, classCountByUser.get(user.id) ?? 0) ===
            'pending',
    ).length;

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <p className="text-sm text-muted-foreground">
                        {users.data.length} total
                        {pendingCount > 0 &&
                            ` · ${pendingCount} waiting for approval`}
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => setDialog({ type: 'form', user: null })}
                    >
                        <Plus aria-hidden />
                        Add user
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative sm:max-w-xs sm:flex-1">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        placeholder="Search first or last name"
                        aria-label="Search users by first or last name"
                        className="pl-8"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                <div
                    className="flex flex-wrap gap-1"
                    role="group"
                    aria-label="Filter by status"
                >
                    {STATUS_FILTERS.map((filter) => (
                        <Button
                            key={filter.value}
                            size="sm"
                            variant={
                                status === filter.value ? 'secondary' : 'ghost'
                            }
                            aria-pressed={status === filter.value}
                            onClick={() => setStatus(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>

            {error && <FormMessage message={getErrorMessage(error)} />}

            {loading ? (
                <PageLoader />
            ) : (
                <UsersTable
                    users={filterUsers(users.data, classCountByUser, {
                        search,
                        status,
                    })}
                    membershipsByUser={membershipsByUser}
                    emptyMessage={
                        users.data.length === 0
                            ? 'No users yet.'
                            : 'No users match your search.'
                    }
                    contacts={contacts.data}
                    classes={classes.data}
                    roles={roles.data}
                    currentUserId={me?.id}
                    canManage={canManage}
                    onEdit={(user) => setDialog({ type: 'form', user })}
                    onToggleActive={(user) =>
                        setDialog({ type: 'toggle-active', user })
                    }
                />
            )}

            {dialog?.type === 'form' && (
                <UserFormDialog
                    user={dialog.user}
                    memberships={
                        dialog.user
                            ? (membershipsByUser.get(dialog.user.id) ?? [])
                            : []
                    }
                    users={users.data}
                    classes={classes.data}
                    roles={roles.data}
                    ownPermissions={me?.permissions ?? []}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'toggle-active' &&
                (dialog.user.deletedAt === null ? (
                    <ConfirmDialog
                        title={`Deactivate ${dialog.user.firstName} ${dialog.user.lastName}?`}
                        description="They'll be locked out of the board right away. Their posts and comments stay, and you can restore them later."
                        confirmLabel="Deactivate"
                        destructive
                        onConfirm={() =>
                            setUserDeactivated(dialog.user.id, true)
                        }
                        onClose={() => setDialog(null)}
                    />
                ) : (
                    <ConfirmDialog
                        title={`Restore ${dialog.user.firstName} ${dialog.user.lastName}?`}
                        description="They get their access back with the same classes and roles."
                        confirmLabel="Restore"
                        onConfirm={() =>
                            setUserDeactivated(dialog.user.id, false)
                        }
                        onClose={() => setDialog(null)}
                    />
                ))}
        </div>
    );
}
