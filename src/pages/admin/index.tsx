import { GraduationCap, Inbox, UserCheck, UserX } from 'lucide-react';
import { Navigate } from 'react-router';

import { AdminClassList } from '@/components/admin/admin-class-list';
import { StatCard } from '@/components/admin/stat-card';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useDocuments } from '@/hooks/use-documents';
import { useSiteStats } from '@/hooks/use-stats';
import { sortClasses } from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup } from '@/types';

// /admin — super admins get site-wide numbers and every class; class admins
// with one class go straight to it, with several they pick one.
export default function AdminIndex() {
    const { isSuperAdmin, adminClassIds } = useAuth();
    const site = useSiteStats(isSuperAdmin);
    const allClasses = useCollection<ClassGroup>(
        isSuperAdmin ? 'classes' : null,
    );
    const myClasses = useDocuments<ClassGroup>(
        isSuperAdmin ? [] : adminClassIds.map((id) => `classes/${id}`),
    );
    const classes = isSuperAdmin ? allClasses : myClasses;

    if (!isSuperAdmin && adminClassIds.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Your role doesn't include admin tools yet.
            </p>
        );
    }

    if (!isSuperAdmin && adminClassIds.length === 1) {
        return <Navigate to={`/admin/classes/${adminClassIds[0]}`} replace />;
    }

    const stats = site.stats;

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Overview</h1>
                <p className="text-sm text-muted-foreground">
                    {isSuperAdmin
                        ? 'Everything across all classes.'
                        : 'Pick a class to manage.'}
                </p>
            </div>

            {isSuperAdmin && (
                <section aria-label="Site numbers" className="grid gap-3">
                    <FormMessage
                        message={site.error ? getErrorMessage(site.error) : ''}
                    />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Open classes"
                            value={stats?.openClasses ?? null}
                            icon={GraduationCap}
                            to="/admin/classes"
                        />
                        <StatCard
                            label="Active users"
                            value={stats?.activeUsers ?? null}
                            icon={UserCheck}
                            to="/admin/users"
                        />
                        <StatCard
                            label="Deactivated users"
                            value={stats?.deactivatedUsers ?? null}
                            icon={UserX}
                            to="/admin/users"
                        />
                        <StatCard
                            label="Pending join requests"
                            value={stats?.joinRequests ?? null}
                            icon={Inbox}
                        />
                    </div>
                </section>
            )}

            <section className="grid gap-3">
                <h2 className="font-semibold">
                    {isSuperAdmin ? 'Classes' : 'Your classes'}
                </h2>
                <FormMessage
                    message={
                        classes.error ? getErrorMessage(classes.error) : ''
                    }
                />
                {classes.loading ? (
                    <PageLoader />
                ) : (
                    <AdminClassList classes={sortClasses(classes.data)} />
                )}
            </section>
        </div>
    );
}
