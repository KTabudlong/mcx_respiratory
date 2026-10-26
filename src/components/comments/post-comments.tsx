import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { useState } from 'react';

import { CommentForm } from '@/components/comments/comment-form';
import { CommentList } from '@/components/comments/comment-thread';
import { FormMessage } from '@/components/common/form-message';
import { NativeSelect } from '@/components/common/native-select';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useComments } from '@/hooks/use-comments';
import { useUsersById } from '@/hooks/use-users-by-id';
import type { CommentSort } from '@/lib/comment-tree';
import { buildCommentTree, DEFAULT_COMMENT_SORT } from '@/lib/comment-tree';
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
    const [actionError, setActionError] = useState('');
    const [sort, setSort] = useState<CommentSort>(DEFAULT_COMMENT_SORT);
    const { comments, deleted, loading, error } = useComments(
        post.classId,
        post.id,
    );
    const authors = useUsersById(comments.map((comment) => comment.userId));
    const tree = buildCommentTree(comments, deleted, sort);

    return (
        <section
            aria-labelledby="comments-heading"
            className="grid gap-4 rounded-lg border bg-card p-4 shadow-xs sm:p-6"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="comments-heading" className="font-semibold">
                    Comments {!loading && `(${comments.length})`}
                </h2>
                <div className="flex items-center gap-1">
                    <label
                        htmlFor="comment-sort"
                        className="text-xs text-muted-foreground"
                    >
                        Sort by
                    </label>
                    <NativeSelect
                        id="comment-sort"
                        className="h-8 w-auto"
                        value={sort.by}
                        onChange={(event) =>
                            setSort({
                                by: event.target.value as CommentSort['by'],
                                dir: sort.dir,
                            })
                        }
                    >
                        <option value="score">Score</option>
                        <option value="date">Date</option>
                    </NativeSelect>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label={
                            sort.dir === 'desc'
                                ? `${sort.by === 'score' ? 'Highest' : 'Newest'} first. Switch to ${sort.by === 'score' ? 'lowest' : 'oldest'} first`
                                : `${sort.by === 'score' ? 'Lowest' : 'Oldest'} first. Switch to ${sort.by === 'score' ? 'highest' : 'newest'} first`
                        }
                        title={sort.dir === 'desc' ? 'Descending' : 'Ascending'}
                        onClick={() =>
                            setSort({
                                by: sort.by,
                                dir: sort.dir === 'desc' ? 'asc' : 'desc',
                            })
                        }
                    >
                        {sort.dir === 'desc' ? (
                            <ArrowDownWideNarrow aria-hidden />
                        ) : (
                            <ArrowUpNarrowWide aria-hidden />
                        )}
                    </Button>
                </div>
            </div>

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
            <FormMessage message={actionError} />

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
                        onError: setActionError,
                    }}
                />
            )}
        </section>
    );
}
