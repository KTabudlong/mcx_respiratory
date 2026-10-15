import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router';

import { useCommentCount } from '@/hooks/use-comment-count';
import type { Post } from '@/types';

export function CommentCountLink({ post }: { post: Post }) {
    const count = useCommentCount(post.classId, post.id);

    return (
        <Link
            to={`/classes/${post.classId}/posts/${post.id}`}
            className="inline-flex items-center gap-1.5 justify-self-start rounded-md text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
            <MessageSquare className="size-3.5" aria-hidden />
            {count === null
                ? 'Comments'
                : `${count} ${count === 1 ? 'comment' : 'comments'}`}
        </Link>
    );
}
