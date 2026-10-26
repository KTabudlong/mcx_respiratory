import { useState } from 'react';
import { toast } from 'sonner';

import {
    DeleteButton,
    RestoreButton,
} from '@/components/common/action-buttons';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks/use-collection';
import { useDocument } from '@/hooks/use-document';
import { useUsersById } from '@/hooks/use-users-by-id';
import { restoreComment, softDeleteComment } from '@/lib/comments';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { matchedThreads, threadOrder } from '@/lib/moderation';
import { cn } from '@/lib/utils';
import type { Comment, Post } from '@/types';

// A tombstone's text lives in its archive doc; older deleted comments and
// live ones carry their own.
function CommentText({ comment }: { comment: Comment }) {
    const archived = comment.deletedAt !== null && comment.body === '';
    const archive = useDocument<{ id: string; body: string }>(
        archived
            ? `classes/${comment.classId}/posts/${comment.postId}/comments/${comment.id}/archive/body`
            : null,
    );
    const body = archived ? archive.data?.body : comment.body;

    return (
        <p className="line-clamp-4 text-sm break-words whitespace-pre-wrap">
            {body ?? (archive.loading ? '…' : '(text not found)')}
        </p>
    );
}

// Every comment on one post, deleted ones included (comments.delete_any),
// in thread order, with delete / restore. With `highlightIds` (search
// matches) only the matching threads show until "Show all".
export function ModerationComments({
    post,
    highlightIds,
}: {
    post: Post;
    highlightIds?: Set<string>;
}) {
    const comments = useCollection<Comment>(
        `classes/${post.classId}/posts/${post.id}/comments`,
    );
    const authors = useUsersById(comments.data.map((item) => item.userId));
    const [busyId, setBusyId] = useState('');
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);

    const ordered = threadOrder(comments.data);
    const filtering = highlightIds !== undefined && !showAll;
    const sorted = filtering ? matchedThreads(ordered, highlightIds) : ordered;
    const hiddenCount = ordered.length - sorted.length;

    async function run(comment: Comment, action: () => Promise<void>) {
        const wasDeleted = comment.deletedAt !== null;

        setBusyId(comment.id);
        setError('');

        try {
            await action();
            toast.success(
                wasDeleted ? 'Comment restored.' : 'Comment deleted.',
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId('');
        }
    }

    if (comments.loading) {
        return <PageLoader />;
    }

    return (
        <div className="grid gap-2">
            <FormMessage
                message={
                    comments.error ? getErrorMessage(comments.error) : error
                }
            />
            {sorted.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments.</p>
            )}
            {highlightIds && (hiddenCount > 0 || showAll) && (
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto justify-self-start p-0 text-xs"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? 'Show matching threads only'
                        : `Show all ${ordered.length} comments (${hiddenCount} hidden)`}
                </Button>
            )}
            <ul className="grid gap-2">
                {sorted.map((comment) => {
                    const author = authors.get(comment.userId);
                    const deleted = comment.deletedAt !== null;

                    return (
                        <li
                            key={comment.id}
                            className={cn(
                                'flex flex-col gap-2 rounded-md border bg-background p-3 sm:flex-row sm:items-start sm:justify-between',
                                deleted && 'opacity-70',
                                highlightIds?.has(comment.id) &&
                                    'border-amber-400 bg-amber-50 ring-1 ring-amber-400 dark:bg-amber-950/40',
                            )}
                            style={{
                                marginLeft: `${comment.ancestorIds.length * 0.75}rem`,
                            }}
                        >
                            <div className="grid min-w-0 gap-1">
                                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {author
                                            ? `${author.firstName} ${author.lastName}`
                                            : '…'}
                                    </span>
                                    {formatDateTime(comment.createdAt.toDate())}
                                    {deleted && (
                                        <Badge variant="outline">Deleted</Badge>
                                    )}
                                </p>
                                <CommentText comment={comment} />
                            </div>
                            {deleted ? (
                                <RestoreButton
                                    label="Restore comment"
                                    className="shrink-0 self-start"
                                    disabled={busyId === comment.id}
                                    onClick={() =>
                                        run(comment, () =>
                                            restoreComment(comment),
                                        )
                                    }
                                />
                            ) : (
                                <DeleteButton
                                    label="Delete comment"
                                    className="shrink-0 self-start"
                                    disabled={busyId === comment.id}
                                    onClick={() =>
                                        run(comment, () =>
                                            softDeleteComment(comment),
                                        )
                                    }
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
