import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { CommentCountLink } from '@/components/posts/comment-count-link';
import { LinkChips } from '@/components/posts/link-chips';
import { PostMeta } from '@/components/posts/post-meta';
import { cn } from '@/lib/utils';
import type { Post, UserProfile } from '@/types';

// Compact feed card: meta, title (links to the post), a body preview and
// link chips. `actions` is the "…" menu, if the user has any.
export function PostCard({
    post,
    author,
    actions,
}: {
    post: Post;
    author: UserProfile | undefined;
    actions?: ReactNode;
}) {
    return (
        <article
            className={cn(
                'grid gap-2 rounded-lg border bg-card p-4 shadow-xs',
                post.pinned && 'border-primary/40',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <PostMeta post={post} author={author} />
                {actions}
            </div>
            <h2 className="text-lg leading-snug font-semibold break-words">
                <Link
                    to={`/classes/${post.classId}/posts/${post.id}`}
                    className="hover:underline focus-visible:underline focus-visible:outline-none"
                >
                    {post.title}
                </Link>
            </h2>
            {post.body && (
                <p className="line-clamp-3 text-sm break-words whitespace-pre-line text-muted-foreground">
                    {post.body}
                </p>
            )}
            <LinkChips links={post.links} />
            <CommentCountLink post={post} />
        </article>
    );
}
