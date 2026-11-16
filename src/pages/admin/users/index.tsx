import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { UsersTable } from '@/components/admin/users-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useAllMemberships } from '@/hooks/use-collection-group';
import type { UserStatus } from '@/lib/account-status';
import { getUserStatus } from '@/lib/account-status';
import { setUserDeactivated } from '@/lib/admin-users';
import { getErrorMessage } from '@/lib/errors';
import { pickParam } from '@/lib/search-params';
import { filterUsers } from '@/lib/user-filters';
import type {
    ClassGroup,
    ClassMember,
    UserContact,
    UserProfile,
} from '@/types';

const STATUS_FILTERS: { value: UserStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'deactivated', label: 'Deactivated' },
];
const STATUS_VALUES = STATUS_FILTERS.map((filter) => filter.value);

function groupByUser(memberships: ClassMember[]) {
    const byUser = new Map<string, ClassMember[]>();

    for (const membership of memberships) {
        byUser.set(membership.userId, [
            ...(byUser.get(membership.userId) ?? []),
            membership,
        ]);
    }

    return byUser;
}

// Super admin only (guarded in the router). Adding people and approving join
// requests happen per class; this page is for finding anyone and
// deactivating accounts app-wide. The status filter lives in the URL
// (`?status=deactivated`) so dashboard cards can open it directly.
export default function AdminUsers() {
    const { user: me } = useAuth();
    const users = useCollection<UserProfile>('users');
    const admins = useCollection<{ id: string }>('admins');
    const memberships = useAllMemberships(true);
    const contacts = useCollection<UserContact>('userContacts');
    const classes = useCollection<ClassGroup>('classes');
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const status = pickParam(searchParams.get('status'), STATUS_VALUES, 'all');
    const [toggling, setToggling] = useState<UserProfile | null>(null);

    const loading =
        users.loading ||
        admins.loading ||
        memberships.loading ||
        contacts.loading ||
        classes.loading;
    const error =
        users.error ??
        admins.error ??
        memberships.error ??
        contacts.error ??
        classes.error;

    const superAdminIds = new Set(admins.data.map((admin) => admin.id));
    const membershipsByUser = groupByUser(memberships.data);
    const classCountByUser = new Map(
        [...membershipsByUser].map(([uid, list]) => [uid, list.length]),
    );
    const pendingCount = users.data.filter(
        (user) =>
            getUserStatus(
                user,
                classCountByUser.get(user.id) ?? 0,
                superAdminIds.has(user.id),
            ) === 'pending',
    ).length;

    return (
        <div className="grid gap-4">
            <div>
                <h1 className="text-2xl font-semibold">All users</h1>
                <p className="text-sm text-muted-foreground">
                    {users.data.length} total
                    {pendingCount > 0 &&
                        ` · ${pendingCount} not in a class yet`}
                    . Approve and invite people from each class's Students page.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    label="Search users by first or last name"
                />
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
                            onClick={() =>
                                setSearchParams(
                                    filter.value === 'all'
                                        ? {}
                                        : { status: filter.value },
                                    { replace: true },
                                )
                            }
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
                    users={filterUsers(
                        users.data,
                        classCountByUser,
                        superAdminIds,
                        { search, status },
                    )}
                    allUsers={users.data}
                    membershipsByUser={membershipsByUser}
                    superAdminIds={superAdminIds}
                    contacts={contacts.data}
                    classes={classes.data}
                    currentUserId={me?.uid}
                    emptyMessage={
                        users.data.length === 0
                            ? 'No users yet.'
                            : 'No users match your search.'
                    }
                    onToggleActive={setToggling}
                />
            )}

            {toggling &&
                (toggling.deletedAt === null ? (
                    <ConfirmDialog
                        title={`Deactivate ${toggling.firstName} ${toggling.lastName}?`}
                        description="They'll be locked out of every class right away. Their posts, comments and memberships stay, and you can restore them later."
                        confirmLabel="Deactivate"
                        successMessage={`${toggling.firstName} ${toggling.lastName} deactivated.`}
                        destructive
                        onConfirm={() => setUserDeactivated(toggling.id, true)}
                        onClose={() => setToggling(null)}
                    />
                ) : (
                    <ConfirmDialog
                        title={`Restore ${toggling.firstName} ${toggling.lastName}?`}
                        description="They get their access back with the same classes and roles."
                        confirmLabel="Restore"
                        successMessage={`${toggling.firstName} ${toggling.lastName} restored.`}
                        onConfirm={() => setUserDeactivated(toggling.id, false)}
                        onClose={() => setToggling(null)}
                    />
                ))}
        </div>
    );
}
