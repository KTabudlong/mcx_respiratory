import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import type { Comment, UserProfile } from '@/types';

// "Jane Doe · 5 minutes ago (edited)". Comments only change when edited
// (deleting hides them), so a later updatedAt means edited.
export function CommentMeta({
    comment,
    author,
}: {
    comment: Comment;
    author: UserProfile | undefined;
}) {
    const created = comment.createdAt.toDate();
    const edited =
        comment.updatedAt.toMillis() - comment.createdAt.toMillis() > 1000;

    return (
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
                {author ? `${author.firstName} ${author.lastName}` : '…'}
            </span>
            <span aria-hidden>·</span>
            <time
                dateTime={created.toISOString()}
                title={formatDateTime(created)}
            >
                {formatRelativeTime(created)}
            </time>
            {edited && <span>(edited)</span>}
        </p>
    );
}
