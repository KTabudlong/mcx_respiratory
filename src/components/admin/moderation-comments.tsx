import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks/use-collection';
import { useUsersById } from '@/hooks/use-users-by-id';
import { restoreComment, softDeleteComment } from '@/lib/comments';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { Comment, Post } from '@/types';

// Every comment on one post, deleted ones included (comments.delete_any),
// oldest first, with delete / restore.
export function ModerationComments({ post }: { post: Post }) {
    const comments = useCollection<Comment>(
        `classes/${post.classId}/posts/${post.id}/comments`,
    );
    const authors = useUsersById(comments.data.map((item) => item.userId));
    const [busyId, setBusyId] = useState('');
    const [error, setError] = useState('');

    const sorted = [...comments.data].sort(
        (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis(),
    );

    async function run(comment: Comment, action: () => Promise<void>) {
        setBusyId(comment.id);
        setError('');

        try {
            await action();
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
                                <p className="line-clamp-4 text-sm break-words whitespace-pre-wrap">
                                    {comment.body}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant={deleted ? 'outline' : 'ghost'}
                                className="shrink-0 self-start"
                                disabled={busyId === comment.id}
                                onClick={() =>
                                    run(comment, () =>
                                        deleted
                                            ? restoreComment(comment)
                                            : softDeleteComment(comment),
                                    )
                                }
                            >
                                {deleted ? 'Restore' : 'Delete'}
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
