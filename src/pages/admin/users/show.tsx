import { useState } from 'react';
import { useParams } from 'react-router';

import { UserActivityCard } from '@/components/admin/user-activity-card';
import { UserClassesCard } from '@/components/admin/user-classes-card';
import { UserProfileCard } from '@/components/admin/user-profile-card';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
    useJoinRequestsOf,
    useMembershipsOf,
    useRecentPostsBy,
} from '@/hooks/use-collection-group';
import { useDocument } from '@/hooks/use-document';
import { useDocuments } from '@/hooks/use-documents';
import { useUserActivity } from '@/hooks/use-stats';
import { getUserStatus } from '@/lib/account-status';
import { makeSuperAdmin, removeSuperAdmin } from '@/lib/admins';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup, ClassRole, UserContact, UserProfile } from '@/types';

const RECENT_POSTS = 10;

// /admin/users/:userId — super admins only (guarded in the router).
export default function AdminUserShow() {
    const { userId = '' } = useParams();
    const { user: me } = useAuth();
    const [confirmAdmin, setConfirmAdmin] = useState(false);
    const user = useDocument<UserProfile>(`users/${userId}`);
    const contact = useDocument<UserContact>(`userContacts/${userId}`);
    const admin = useDocument<{ id: string }>(`admins/${userId}`);
    const inviter = useDocument<UserProfile>(
        user.data?.createdBy ? `users/${user.data.createdBy}` : null,
    );
    const memberships = useMembershipsOf(userId);
    const requests = useJoinRequestsOf(userId);
    const posts = useRecentPostsBy(userId, RECENT_POSTS);
    const activity = useUserActivity(userId);

    const classIds = new Set([
        ...memberships.data.map((membership) => membership.classId),
        ...requests.data.map((request) => request.classId),
        ...posts.data.map((post) => post.classId),
        ...(user.data?.createdInClassId ? [user.data.createdInClassId] : []),
    ]);
    const classes = useDocuments<ClassGroup>(
        [...classIds].map((id) => `classes/${id}`),
    );
    const roles = useDocuments<ClassRole>(
        memberships.data.map(
            (membership) =>
                `classes/${membership.classId}/roles/${membership.roleId}`,
        ),
    );
    const classById = new Map(classes.data.map((item) => [item.id, item]));
    const roleByClass = new Map(roles.data.map((role) => [role.classId, role]));

    const error =
        user.error ??
        contact.error ??
        memberships.error ??
        requests.error ??
        null;

    if (user.loading || admin.loading) {
        return <PageLoader />;
    }

    if (!user.data) {
        return (
            <FormMessage
                message={error ? getErrorMessage(error) : 'User not found.'}
            />
        );
    }

    const isSuperAdmin = admin.data !== null;
    const status = getUserStatus(
        user.data,
        memberships.data.length,
        isSuperAdmin,
    );

    const fullName = `${user.data.firstName} ${user.data.lastName}`;
    const canToggleAdmin =
        userId !== me?.uid && (isSuperAdmin || user.data.deletedAt === null);

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
                        {fullName}
                        <UserStatusBadge status={status} />
                        {isSuperAdmin && <Badge>Super admin</Badge>}
                    </h1>
                    <p className="text-sm break-all text-muted-foreground">
                        {user.data.email}
                    </p>
                </div>
                {canToggleAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => setConfirmAdmin(true)}
                    >
                        {isSuperAdmin
                            ? 'Remove super admin'
                            : 'Make super admin'}
                    </Button>
                )}
            </div>

            {confirmAdmin && (
                <ConfirmDialog
                    title={
                        isSuperAdmin
                            ? `Remove ${fullName} as super admin?`
                            : `Make ${fullName} a super admin?`
                    }
                    description={
                        isSuperAdmin
                            ? 'They lose access to every class and the admin pages, unless their class roles allow it.'
                            : 'They can see and manage every class, user and post, and add or remove other super admins.'
                    }
                    confirmLabel={isSuperAdmin ? 'Remove' : 'Make super admin'}
                    destructive={isSuperAdmin}
                    onConfirm={() =>
                        isSuperAdmin
                            ? removeSuperAdmin(userId)
                            : makeSuperAdmin(userId)
                    }
                    onClose={() => setConfirmAdmin(false)}
                />
            )}

            {error && <FormMessage message={getErrorMessage(error)} />}

            <div className="grid gap-4 lg:grid-cols-2">
                <UserProfileCard
                    user={user.data}
                    contact={contact.data}
                    inviter={inviter.data}
                    invitedInto={
                        user.data.createdInClassId
                            ? classById.get(user.data.createdInClassId)
                            : undefined
                    }
                />
                <UserClassesCard
                    memberships={memberships.data}
                    requests={requests.data}
                    classById={classById}
                    roleByClass={roleByClass}
                />
            </div>

            <UserActivityCard
                activity={activity.stats}
                posts={posts.data}
                loading={posts.loading}
                error={posts.error ?? activity.error}
                classById={classById}
            />
        </div>
    );
}
