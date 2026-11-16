import { ImageIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { CommentCountLink } from '@/components/posts/comment-count-link';
import { LinkChips } from '@/components/posts/link-chips';
import { PostMeta } from '@/components/posts/post-meta';
import { postBodyText } from '@/lib/rich-text';
import { cn } from '@/lib/utils';
import type { Post, UserProfile } from '@/types';

// Compact feed card: meta, title (links to the post), a body preview and
// link chips. `actions` is the "…" menu, if the user has any; `votes` the
// vote buttons.
export function PostCard({
    post,
    author,
    editor,
    actions,
    votes,
}: {
    post: Post;
    author: UserProfile | undefined;
    editor: UserProfile | undefined;
    actions?: ReactNode;
    votes?: ReactNode;
}) {
    const preview = postBodyText(post);
    const imageCount = post.imageIds?.length ?? 0;

    return (
        <article
            className={cn(
                'grid gap-2 rounded-lg border bg-card p-4 shadow-xs',
                post.pinned && 'border-primary/40',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <PostMeta post={post} author={author} editor={editor} />
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
            {preview && (
                <p className="line-clamp-3 text-sm break-words whitespace-pre-line text-muted-foreground">
                    {preview}
                </p>
            )}
            <LinkChips links={post.links} />
            <div className="flex flex-wrap items-center gap-4">
                {votes}
                <CommentCountLink post={post} />
                {imageCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ImageIcon className="size-3.5" aria-hidden />
                        {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                    </span>
                )}
            </div>
        </article>
    );
}
