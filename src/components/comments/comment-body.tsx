import { useDocument } from '@/hooks/use-document';
import type { Comment } from '@/types';

// Live comments carry their text; tombstones store it in archive/body.
export function CommentBody({ comment }: { comment: Comment }) {
    const archived = comment.deletedAt !== null && comment.body === '';
    const archive = useDocument<{ id: string; body: string }>(
        archived
            ? `classes/${comment.classId}/posts/${comment.postId}/comments/${comment.id}/archive/body`
            : null,
    );
    const body = archived ? archive.data?.body : comment.body;

    return (
        <p className="text-sm break-words whitespace-pre-wrap">
            {body ?? (archive.loading ? '…' : '(text not found)')}
        </p>
    );
}
