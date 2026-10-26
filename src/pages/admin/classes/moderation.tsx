import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { ClassPageHeader } from '@/components/admin/class-page-header';
import { ModerationTable } from '@/components/admin/moderation-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useClassComments } from '@/hooks/use-class-comments';
import { useDocument } from '@/hooks/use-document';
import { useModerationPosts } from '@/hooks/use-posts';
import { useUsersById } from '@/hooks/use-users-by-id';
import { getErrorMessage } from '@/lib/errors';
import type { ModerationSortKey, ModerationStatus } from '@/lib/moderation';
import {
    commentHits,
    MODERATION_SORT_KEYS,
    moderationRows,
} from '@/lib/moderation';
import { postAbilities } from '@/lib/permissions';
import { restorePost, setPostPinned, softDeletePost } from '@/lib/posts';
import { pickParam, withParams } from '@/lib/search-params';
import { nextSort } from '@/lib/table-sort';
import type { ClassGroup, Post } from '@/types';

const FILTERS: { value: ModerationStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'deleted', label: 'Deleted' },
];
const FILTER_VALUES = FILTERS.map((item) => item.value);

// /admin/classes/:classId/moderation — any MODERATION_PERMISSIONS (guarded
// in the router); each row offers only what the role allows. Deleted posts
// (posts.delete_any) stay here so they can be restored. Filter and sort
// live in the URL (`?status=deleted&sort=title&dir=asc`); no sort = newest
// first.
export default function ClassModeration() {
    const { classId = '' } = useParams();
    const { canIn, accessIn, user } = useAuth();
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const classOpen = classGroup.data?.archivedAt === null;
    const canPosts = canIn(classId, 'posts.delete_any');
    const canComments = canIn(classId, 'comments.delete_any');
    const { posts, loading, error } = useModerationPosts(classId, canPosts);
    const authors = useUsersById(posts.map((post) => post.userId));
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    // Posts the user opened or closed by hand; comment matches open by
    // default, so for those this set means "closed".
    const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());
    const searchComments = canComments && search.trim() !== '';
    const classComments = useClassComments(
        classId,
        posts.map((post) => post.id),
        searchComments,
    );
    const hits = commentHits(
        classComments.comments,
        classComments.archived,
        search,
    );
    const [deleting, setDeleting] = useState<Post | null>(null);
    const [actionError, setActionError] = useState('');

    const status = canPosts
        ? pickParam(searchParams.get('status'), FILTER_VALUES, 'all')
        : 'live';
    const sortKey = MODERATION_SORT_KEYS.find(
        (key) => key === searchParams.get('sort'),
    );
    const sort = sortKey
        ? {
              key: sortKey,
              dir: pickParam(
                  searchParams.get('dir'),
                  ['asc', 'desc'] as const,
                  'asc',
              ),
          }
        : null;
    const rows = moderationRows(posts, authors, {
        status,
        query: search,
        sort,
        hits,
    });

    function handleSearch(value: string) {
        setSearch(value);
        setToggledIds(new Set());
    }

    function handleToggle(post: Post) {
        const next = new Set(toggledIds);

        if (!next.delete(post.id)) {
            next.add(post.id);
        }

        setToggledIds(next);
    }

    function updateParams(changes: Record<string, string | null>) {
        setSearchParams((current) => withParams(current, changes), {
            replace: true,
        });
    }

    function handleSort(key: ModerationSortKey) {
        const next = nextSort(sort, key);

        updateParams({ sort: next?.key ?? null, dir: next?.dir ?? null });
    }

    function abilitiesOf(post: Post) {
        const { canEdit, canPin } = postAbilities(
            post,
            user?.uid,
            accessIn(classId),
            classOpen,
        );

        return { canEdit, canPin };
    }

    async function handleTogglePin(post: Post) {
        setActionError('');

        try {
            await setPostPinned(post.classId, post.id, !post.pinned);
            toast.success(
                post.pinned
                    ? `“${post.title}” unpinned.`
                    : `“${post.title}” pinned to top.`,
            );
        } catch (err) {
            setActionError(getErrorMessage(err));
        }
    }

    async function handleRestore(post: Post) {
        setActionError('');

        try {
            await restorePost(post.classId, post.id);
            toast.success(`“${post.title}” restored.`);
        } catch (err) {
            setActionError(getErrorMessage(err));
        }
    }

    return (
        <div className="grid gap-4">
            <ClassPageHeader
                classId={classId}
                title="Moderation"
                description={
                    canPosts
                        ? 'Every post in this class, including deleted ones. Deleting hides an item from the board; restoring brings it back.'
                        : 'Every post in this class. You can do what your role allows from here.'
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput
                    value={search}
                    onChange={handleSearch}
                    label={
                        canComments
                            ? 'Search posts and comments'
                            : 'Search posts by title or text'
                    }
                    placeholder={
                        canComments
                            ? 'Search posts and comments'
                            : 'Search posts'
                    }
                />
                {canPosts && (
                    <div
                        className="flex flex-wrap gap-1"
                        role="group"
                        aria-label="Filter by status"
                    >
                        {FILTERS.map((item) => (
                            <Button
                                key={item.value}
                                size="sm"
                                variant={
                                    status === item.value
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                aria-pressed={status === item.value}
                                onClick={() =>
                                    updateParams({
                                        status:
                                            item.value === 'all'
                                                ? null
                                                : item.value,
                                    })
                                }
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {searchComments && classComments.loading && (
                <p className="text-sm text-muted-foreground">
                    Searching comments…
                </p>
            )}
            {(error ?? classComments.error) && (
                <FormMessage
                    message={getErrorMessage(error ?? classComments.error)}
                />
            )}
            <FormMessage message={actionError} />

            {loading ? (
                <PageLoader />
            ) : (
                <ModerationTable
                    posts={rows}
                    hasPosts={posts.length > 0}
                    authors={authors}
                    sort={sort}
                    hits={hits}
                    toggledIds={toggledIds}
                    canPosts={canPosts}
                    canComments={canComments}
                    abilitiesOf={abilitiesOf}
                    onSort={handleSort}
                    onToggle={handleToggle}
                    onDelete={setDeleting}
                    onRestore={handleRestore}
                    onTogglePin={handleTogglePin}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title={`Delete “${deleting.title}”?`}
                    description="It disappears from the board. You can restore it here later."
                    confirmLabel="Delete post"
                    successMessage="Post deleted. You can restore it here."
                    destructive
                    onConfirm={() =>
                        softDeletePost(deleting.classId, deleting.id)
                    }
                    onClose={() => setDeleting(null)}
                />
            )}
        </div>
    );
}
