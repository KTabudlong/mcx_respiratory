import { sanitizePostHtml } from '@/lib/sanitize-html';
import type { Post } from '@/types';

// Full post text: rich-text posts are sanitized HTML, older posts plain text.
export function PostBody({ post }: { post: Pick<Post, 'body' | 'format'> }) {
    if (!post.body) {
        return null;
    }

    if (post.format === 'html') {
        return (
            <div
                className="rich-text"
                dangerouslySetInnerHTML={{
                    __html: sanitizePostHtml(post.body),
                }}
            />
        );
    }

    return <p className="break-words whitespace-pre-wrap">{post.body}</p>;
}
