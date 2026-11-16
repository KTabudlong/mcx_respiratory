import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { ClassFormDialog } from '@/components/admin/class-form-dialog';
import { ClassRequestsCard } from '@/components/admin/class-requests-card';
import { ClassesTable } from '@/components/admin/classes-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection } from '@/hooks/use-collection';
import {
    useAllJoinRequests,
    useAllMemberships,
} from '@/hooks/use-collection-group';
import { setClassArchived, sortClasses } from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import { pickParam } from '@/lib/search-params';
import type { ClassGroup, ClassRequest, UserProfile } from '@/types';

const TABS = ['active', 'archived', 'requests'] as const;

type DialogState =
    | { type: 'form'; classGroup: ClassGroup | null }
    | { type: 'toggle-archive'; classGroup: ClassGroup }
    | null;

function countBy(items: { classId: string }[]) {
    const counts = new Map<string, number>();

    for (const item of items) {
        counts.set(item.classId, (counts.get(item.classId) ?? 0) + 1);
    }

    return counts;
}

// Super admin only (guarded in the router). The tab lives in the URL
// (`?tab=requests`) so dashboard links can open it directly.
export default function AdminClasses() {
    const classes = useCollection<ClassGroup>('classes');
    const users = useCollection<UserProfile>('users');
    const requests = useCollection<ClassRequest>('classRequests');
    const memberships = useAllMemberships(true);
    const joinRequests = useAllJoinRequests(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [dialog, setDialog] = useState<DialogState>(null);

    const tab = pickParam(searchParams.get('tab'), TABS, 'active');
    const error =
        classes.error ??
        users.error ??
        requests.error ??
        memberships.error ??
        joinRequests.error;
    const loading =
        classes.loading ||
        users.loading ||
        memberships.loading ||
        joinRequests.loading;
    const usersById = new Map(users.data.map((user) => [user.id, user]));
    const deactivatedIds = new Set(
        users.data
            .filter((user) => user.deletedAt !== null)
            .map((user) => user.id),
    );
    const memberCounts = countBy(
        memberships.data.filter(
            (membership) => !deactivatedIds.has(membership.userId),
        ),
    );
    const joinRequestCounts = countBy(joinRequests.data);
    const sorted = sortClasses(classes.data);
    const active = sorted.filter((item) => item.archivedAt === null);
    const archived = sorted.filter((item) => item.archivedAt !== null);

    function changeTab(value: string) {
        setSearchParams(value === 'active' ? {} : { tab: value }, {
            replace: true,
        });
    }

    const tableActions = {
        memberCounts,
        onEdit: (classGroup: ClassGroup) =>
            setDialog({ type: 'form', classGroup }),
        onToggleArchive: (classGroup: ClassGroup) =>
            setDialog({ type: 'toggle-archive', classGroup }),
    };

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Classes</h1>
                    <p className="text-sm text-muted-foreground">
                        New classes start with a Student role (and a President
                        role if you pick one). Archive old cohorts instead of
                        deleting them.
                    </p>
                </div>
                <Button
                    onClick={() =>
                        setDialog({ type: 'form', classGroup: null })
                    }
                >
                    <Plus aria-hidden />
                    Add class
                </Button>
            </div>

            {error && <FormMessage message={getErrorMessage(error)} />}

            <Tabs value={tab} onValueChange={changeTab}>
                <TabsList>
                    <TabsTrigger value="active">
                        Active ({active.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Archived ({archived.length})
                    </TabsTrigger>
                    <TabsTrigger value="requests">
                        Requests ({requests.data.length})
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <PageLoader />
                ) : (
                    <>
                        <TabsContent value="active">
                            <ClassesTable
                                {...tableActions}
                                classes={active}
                                joinRequestCounts={joinRequestCounts}
                                emptyMessage={
                                    classes.data.length === 0
                                        ? 'No classes yet. Add your first cohort.'
                                        : 'No active classes.'
                                }
                            />
                        </TabsContent>
                        <TabsContent value="archived">
                            <ClassesTable
                                {...tableActions}
                                classes={archived}
                                emptyMessage="No archived classes."
                            />
                        </TabsContent>
                        <TabsContent value="requests">
                            <ClassRequestsCard
                                requests={[...requests.data].sort(
                                    (a, b) =>
                                        (a.createdAt?.toMillis() ?? 0) -
                                        (b.createdAt?.toMillis() ?? 0),
                                )}
                                usersById={usersById}
                            />
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {dialog?.type === 'form' && (
                <ClassFormDialog
                    classGroup={dialog.classGroup}
                    users={users.data}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog?.type === 'toggle-archive' && (
                <ConfirmDialog
                    title={`${dialog.classGroup.archivedAt === null ? 'Archive' : 'Unarchive'} ${dialog.classGroup.name}?`}
                    description={
                        dialog.classGroup.archivedAt === null
                            ? 'It disappears from the class lists for new assignments. Members and posts stay.'
                            : 'It becomes available for assignments again.'
                    }
                    confirmLabel={
                        dialog.classGroup.archivedAt === null
                            ? 'Archive'
                            : 'Unarchive'
                    }
                    successMessage={`${dialog.classGroup.name} ${dialog.classGroup.archivedAt === null ? 'archived' : 'unarchived'}.`}
                    onConfirm={() =>
                        setClassArchived(
                            dialog.classGroup.id,
                            dialog.classGroup.archivedAt === null,
                        )
                    }
                    onClose={() => setDialog(null)}
                />
            )}
        </div>
    );
}
