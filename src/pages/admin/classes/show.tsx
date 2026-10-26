import { FileText, FileX, Inbox, Users } from 'lucide-react';
import { useParams } from 'react-router';

import { CLASS_NAV } from '@/components/admin/admin-sidebar';
import { ClassPageHeader } from '@/components/admin/class-page-header';
import { StatCard } from '@/components/admin/stat-card';
import { FormMessage } from '@/components/common/form-message';
import { useAuth } from '@/hooks/use-auth';
import { useClassStats } from '@/hooks/use-stats';
import { getErrorMessage } from '@/lib/errors';

// /admin/classes/:classId — the class dashboard. Each number links to the
// page behind it when the viewer's role can open that page.
export default function AdminClassIndex() {
    const { canIn } = useAuth();
    const { classId = '' } = useParams();
    const canSeeRoster =
        canIn(classId, 'students.view') || canIn(classId, 'students.manage');
    const canManageStudents = canIn(classId, 'students.manage');
    const canModerate =
        canIn(classId, 'posts.delete_any') ||
        canIn(classId, 'comments.delete_any');
    const canSeeDeleted = canIn(classId, 'posts.delete_any');
    const { stats, error } = useClassStats(
        classId,
        canSeeDeleted,
        canManageStudents,
    );
    const pages = CLASS_NAV.filter((item) =>
        item.anyOf.some((permission) => canIn(classId, permission)),
    );
    const base = `/admin/classes/${classId}`;

    return (
        <div className="grid gap-6">
            <ClassPageHeader
                classId={classId}
                title="Overview"
                description="This class at a glance."
            />

            <FormMessage message={error ? getErrorMessage(error) : ''} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Members"
                    value={stats?.members ?? null}
                    icon={Users}
                    to={canSeeRoster ? `${base}/students` : undefined}
                />
                {canManageStudents && (
                    <StatCard
                        label="Pending join requests"
                        value={stats?.joinRequests ?? null}
                        icon={Inbox}
                        to={`${base}/students`}
                    />
                )}
                <StatCard
                    label="Posts"
                    value={stats?.posts ?? null}
                    icon={FileText}
                    to={
                        canModerate
                            ? `${base}/moderation?status=live`
                            : undefined
                    }
                />
                {canSeeDeleted && (
                    <StatCard
                        label="Deleted posts"
                        value={stats?.deletedPosts ?? null}
                        icon={FileX}
                        to={`${base}/moderation?status=deleted`}
                    />
                )}
            </div>

            {pages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Your role in this class opens the admin panel, but doesn't
                    include any admin pages yet. Ask someone who manages roles
                    to add permissions.
                </p>
            )}
        </div>
    );
}
