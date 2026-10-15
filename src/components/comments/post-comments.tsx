import { useState } from 'react';

import { CommentForm } from '@/components/comments/comment-form';
import { CommentList } from '@/components/comments/comment-thread';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { useAuth } from '@/hooks/use-auth';
import { useComments } from '@/hooks/use-comments';
import { useUsersById } from '@/hooks/use-users-by-id';
import { buildCommentTree } from '@/lib/comment-tree';
import { createComment } from '@/lib/comments';
import { getErrorMessage } from '@/lib/errors';
import type { Post, VoteValue } from '@/types';

// The comments section under a post: a new-comment box and the live thread.
// `myVotes` is useMyVotes() from the page (keyed by comment path).
export function PostComments({
    post,
    classOpen,
    myVotes,
}: {
    post: Post;
    classOpen: boolean;
    myVotes: Map<string, VoteValue>;
}) {
    const { user, accessIn } = useAuth();
    const [voteError, setVoteError] = useState('');
    const { comments, loading, error } = useComments(post.classId, post.id);
    const authors = useUsersById(comments.map((comment) => comment.userId));
    const tree = buildCommentTree(comments);

    return (
        <section
            aria-labelledby="comments-heading"
            className="grid gap-4 rounded-lg border bg-card p-4 shadow-xs sm:p-6"
        >
            <h2 id="comments-heading" className="font-semibold">
                Comments {!loading && `(${comments.length})`}
            </h2>

            {classOpen ? (
                <CommentForm
                    label="Add a comment"
                    submitLabel="Comment"
                    onSubmit={(body) =>
                        createComment(
                            post.classId,
                            post.id,
                            user?.uid ?? '',
                            null,
                            body,
                        ).then(() => undefined)
                    }
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    This class is archived, so comments are closed.
                </p>
            )}

            {error && <FormMessage message={getErrorMessage(error)} />}
            <FormMessage message={voteError} />

            {loading ? (
                <PageLoader />
            ) : tree.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No comments yet.
                </p>
            ) : (
                <CommentList
                    nodes={tree}
                    context={{
                        classId: post.classId,
                        postId: post.id,
                        userId: user?.uid,
                        access: accessIn(post.classId),
                        classOpen,
                        authors,
                        myVotes,
                        onVoteError: setVoteError,
                    }}
                />
            )}
        </section>
    );
}
