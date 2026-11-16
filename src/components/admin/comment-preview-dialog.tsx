import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { CommentBody } from '@/components/comments/comment-body';
import { DeletedBadge } from '@/components/common/deleted-badge';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { useDocument } from '@/hooks/use-document';
import { useUsersById } from '@/hooks/use-users-by-id';
import { restoreComment } from '@/lib/comments';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { commentSubtree } from '@/lib/moderation';
import { cn } from '@/lib/utils';
import type { Comment, Post } from '@/types';

// Comment + replies preview from Activity. Restore is offered when the
// comment is deleted and the viewer may restore it.
export function CommentPreviewDialog({
    comment,
    canRestore = false,
    onClose,
}: {
    comment: Comment;
    canRestore?: boolean;
    onClose: () => void;
}) {
    const deleted = comment.deletedAt !== null;
    const showRestore = canRestore && deleted;
    const post = useDocument<Post>(
        `classes/${comment.classId}/posts/${comment.postId}`,
    );
    const comments = useCollection<Comment>(
        `classes/${comment.classId}/posts/${comment.postId}/comments`,
    );
    const subtree = commentSubtree(comments.data, comment);
    const authors = useUsersById(subtree.map((item) => item.userId));
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const rootDepth = comment.ancestorIds.length;
    const replyCount = Math.max(0, subtree.length - 1);

    async function handleRestore() {
        setBusy(true);
        setError('');

        try {
            await restoreComment(comment);
            toast.success('Comment restored.');
            onClose();
        } catch (err) {
            setError(getErrorMessage(err));
            setBusy(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {showRestore ? 'Restore comment?' : 'Comment'}
                    </DialogTitle>
                    <DialogDescription>
                        {showRestore
                            ? `Review the comment${replyCount > 0 ? ` and its ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : ''} before bringing it back to the board.`
                            : `This comment${replyCount > 0 ? ` and its ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : ''}.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 text-sm">
                    <p className="text-muted-foreground">
                        Post:{' '}
                        {post.loading ? (
                            '…'
                        ) : post.data ? (
                            <Link
                                to={`/classes/${comment.classId}/posts/${comment.postId}?comment=${comment.id}`}
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                {post.data.title}
                            </Link>
                        ) : (
                            '(post not found)'
                        )}
                    </p>

                    <FormMessage
                        message={
                            error ||
                            (comments.error
                                ? getErrorMessage(comments.error)
                                : '')
                        }
                    />

                    {comments.loading ? (
                        <PageLoader />
                    ) : (
                        <ul className="max-h-64 divide-y overflow-y-auto rounded-md border bg-card">
                            {subtree.map((item) => {
                                const author = authors.get(item.userId);
                                const itemDeleted = item.deletedAt !== null;
                                const depth = Math.max(
                                    0,
                                    item.ancestorIds.length - rootDepth,
                                );

                                return (
                                    <li
                                        key={item.id}
                                        className={cn(
                                            'grid gap-1 px-3 py-2',
                                            item.id === comment.id &&
                                                'bg-muted/40',
                                            itemDeleted && 'opacity-80',
                                        )}
                                        style={{
                                            marginLeft: `${depth * 0.75}rem`,
                                        }}
                                    >
                                        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {author
                                                    ? `${author.firstName} ${author.lastName}`
                                                    : '…'}
                                            </span>
                                            {formatDateTime(
                                                item.createdAt.toDate(),
                                            )}
                                            {itemDeleted && <DeletedBadge />}
                                            {item.id === comment.id && (
                                                <span className="text-xs font-medium text-foreground">
                                                    This comment
                                                </span>
                                            )}
                                        </p>
                                        <CommentBody comment={item} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={busy}>
                        {showRestore ? 'Cancel' : 'Close'}
                    </Button>
                    {showRestore && (
                        <Button onClick={handleRestore} disabled={busy}>
                            Restore comment
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
