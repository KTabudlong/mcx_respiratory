import { useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

import { ClassPageHeader } from '@/components/admin/class-page-header';
import { ModerationPostRow } from '@/components/admin/moderation-post-row';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useModerationPosts } from '@/hooks/use-posts';
import { useUsersById } from '@/hooks/use-users-by-id';
import { getErrorMessage } from '@/lib/errors';
import { restorePost, softDeletePost } from '@/lib/posts';
import type { Post } from '@/types';

type StatusFilter = 'all' | 'live' | 'deleted';

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'deleted', label: 'Deleted' },
];

// /admin/classes/:classId/moderation — posts.delete_any or
// comments.delete_any (guarded in the router). Deleted items stay here so
// they can be restored.
export default function ClassModeration() {
    const { classId = '' } = useParams();
    const { canIn } = useAuth();
    const canPosts = canIn(classId, 'posts.delete_any');
    const canComments = canIn(classId, 'comments.delete_any');
    const { posts, loading, error } = useModerationPosts(classId, canPosts);
    const authors = useUsersById(posts.map((post) => post.userId));
    const [filter, setFilter] = useState<StatusFilter>(
        canPosts ? 'all' : 'live',
    );
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState('');
    const [deleting, setDeleting] = useState<Post | null>(null);
    const [actionError, setActionError] = useState('');

    const query = search.trim().toLowerCase();
    const rows = posts
        .filter(
            (post) =>
                filter === 'all' ||
                (filter === 'deleted') === (post.deletedAt !== null),
        )
        .filter((post) => post.title.toLowerCase().includes(query));

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
                description="Every post in this class, including deleted ones. Deleting hides an item from the board; restoring brings it back."
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    label="Search posts by title"
                    placeholder="Search post titles"
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
                                    filter === item.value
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                aria-pressed={filter === item.value}
                                onClick={() => setFilter(item.value)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {error && <FormMessage message={getErrorMessage(error)} />}
            <FormMessage message={actionError} />

            {loading ? (
                <PageLoader />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Post</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Posted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {posts.length === 0
                                            ? 'No posts in this class yet.'
                                            : 'No posts match.'}
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((post) => (
                                <ModerationPostRow
                                    key={post.id}
                                    post={post}
                                    author={authors.get(post.userId)}
                                    open={openId === post.id}
                                    canPosts={canPosts}
                                    canComments={canComments}
                                    onToggle={() =>
                                        setOpenId(
                                            openId === post.id ? '' : post.id,
                                        )
                                    }
                                    onDelete={() => setDeleting(post)}
                                    onRestore={() => handleRestore(post)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
