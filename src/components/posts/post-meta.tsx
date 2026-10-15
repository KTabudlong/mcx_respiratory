import { Pin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import type { Post, UserProfile } from '@/types';

// "Pinned · Jane Doe · 3 hours ago"
export function PostMeta({
    post,
    author,
}: {
    post: Post;
    author: UserProfile | undefined;
}) {
    const created = post.createdAt.toDate();

    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {post.pinned && (
                <Badge variant="secondary" className="gap-1">
                    <Pin aria-hidden />
                    Pinned
                </Badge>
            )}
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
        </div>
    );
}
