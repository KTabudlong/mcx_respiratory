import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';

import { MemberDetailsCard } from '@/components/admin/member-details-card';
import { MemberPostsCard } from '@/components/admin/member-posts-card';
import { RoleBadge } from '@/components/admin/role-badge';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import { useMemberPosts } from '@/hooks/use-posts';
import { getErrorMessage } from '@/lib/errors';
import { hasClassPermission } from '@/lib/permissions';
import { restorePost } from '@/lib/posts';
import type { ClassMember, ClassRole, Post, UserProfile } from '@/types';

// /admin/classes/:classId/students/:userId — students.view or
// students.manage (guarded in the router). Read-only: changes happen on the
// roster.
export default function ClassStudentShow() {
    const { classId = '', userId = '' } = useParams();
    const { user: me, accessIn } = useAuth();
    const access = accessIn(classId);
    const canSeeDeleted = hasClassPermission(access, 'posts.delete_any');
    const [restoreError, setRestoreError] = useState('');

    const member = useDocument<ClassMember>(
        `classes/${classId}/members/${userId}`,
    );
    const user = useDocument<UserProfile>(`users/${userId}`);
    const role = useDocument<ClassRole>(
        member.data ? `classes/${classId}/roles/${member.data.roleId}` : null,
    );
    const addedBy = useDocument<UserProfile>(
        member.data?.addedBy ? `users/${member.data.addedBy}` : null,
    );
    const posts = useMemberPosts(classId, userId, canSeeDeleted);

    const error = member.error ?? user.error ?? null;

    async function handleRestore(post: Post) {
        setRestoreError('');

        try {
            await restorePost(post.classId, post.id);
            toast.success(`“${post.title}” restored.`);
        } catch (err) {
            setRestoreError(getErrorMessage(err));
        }
    }

    if (member.loading || user.loading) {
        return <PageLoader />;
    }

    if (!member.data || !user.data) {
        return (
            <div className="grid gap-4">
                <FormMessage
                    message={
                        error
                            ? getErrorMessage(error)
                            : "This person isn't in this class."
                    }
                />
                <div>
                    <Button asChild variant="outline">
                        <Link to={`/admin/classes/${classId}/students`}>
                            Back to students
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
                        {user.data.firstName} {user.data.lastName}
                        {userId === me?.uid && (
                            <span className="text-base font-normal text-muted-foreground">
                                (you)
                            </span>
                        )}
                        <RoleBadge role={role.data ?? undefined} />
                        {user.data.deletedAt && (
                            <Badge variant="outline">Deactivated</Badge>
                        )}
                    </h1>
                    <p className="text-sm break-all text-muted-foreground">
                        {user.data.email}
                    </p>
                </div>
                {access.isSuperAdmin && (
                    <Button asChild variant="outline">
                        <Link to={`/admin/users/${userId}`}>
                            Full user page
                        </Link>
                    </Button>
                )}
            </div>

            {(error || restoreError) && (
                <FormMessage
                    message={
                        restoreError || (error ? getErrorMessage(error) : '')
                    }
                />
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <MemberDetailsCard
                    user={user.data}
                    member={member.data}
                    role={role.data ?? undefined}
                    addedBy={addedBy.data}
                />
                <MemberPostsCard
                    posts={posts.posts}
                    loading={posts.loading}
                    error={posts.error}
                    canRestore={canSeeDeleted}
                    onRestore={handleRestore}
                />
            </div>
        </div>
    );
}
