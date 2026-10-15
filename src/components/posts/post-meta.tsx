import { Pin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import type { Post, UserProfile } from '@/types';

function fullName(user: UserProfile | undefined) {
    return user ? `${user.firstName} ${user.lastName}` : '…';
}

// "Pinned · Jane Doe · 3 hours ago · edited by John Roe 5 min ago"
export function PostMeta({
    post,
    author,
    editor,
}: {
    post: Post;
    author: UserProfile | undefined;
    editor: UserProfile | undefined;
}) {
    const created = post.createdAt.toDate();
    const edited = post.editedAt?.toDate();

    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {post.pinned && (
                <Badge variant="secondary" className="gap-1">
                    <Pin aria-hidden />
                    Pinned
                </Badge>
            )}
            <span className="font-medium text-foreground">
                {fullName(author)}
            </span>
            <span aria-hidden>·</span>
            <time
                dateTime={created.toISOString()}
                title={formatDateTime(created)}
            >
                {formatRelativeTime(created)}
            </time>
            {post.editedBy && edited && (
                <>
                    <span aria-hidden>·</span>
                    <span>
                        edited by {fullName(editor)}{' '}
                        <time
                            dateTime={edited.toISOString()}
                            title={formatDateTime(edited)}
                        >
                            {formatRelativeTime(edited)}
                        </time>
                    </span>
                </>
            )}
        </div>
    );
}
