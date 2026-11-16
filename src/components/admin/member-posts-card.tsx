import { Link } from 'react-router';

import { RestoreButton } from '@/components/common/action-buttons';
import { DeletedBadge } from '@/components/common/deleted-badge';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import type { Post } from '@/types';

// One member's posts in one class. Deleted ones are only passed in for
// roles that can see them.
export function MemberPostsCard({
    posts,
    loading,
    error,
    canRestore = false,
    onRestore,
}: {
    posts: Post[];
    loading: boolean;
    error: Error | null;
    canRestore?: boolean;
    onRestore?: (post: Post) => void;
}) {
    const deleted = posts.filter((post) => post.deletedAt !== null).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts in this class</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {!loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                        {deleted > 0 && ` (${deleted} deleted)`}
                    </p>
                )}
                <FormMessage message={error ? getErrorMessage(error) : ''} />
                {loading ? (
                    <PageLoader />
                ) : posts.length === 0 ? (
                    !error && (
                        <p className="text-sm text-muted-foreground">
                            No posts yet.
                        </p>
                    )
                ) : (
                    <ul className="divide-y rounded-md border bg-card">
                        {posts.map((post) => (
                            <li
                                key={post.id}
                                className="flex items-start justify-between gap-2 px-3 py-2"
                            >
                                <div className="grid min-w-0 gap-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {post.deletedAt ? (
                                            <span className="font-medium text-muted-foreground">
                                                {post.title}
                                            </span>
                                        ) : (
                                            <Link
                                                to={`/classes/${post.classId}/posts/${post.id}`}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                {post.title}
                                            </Link>
                                        )}
                                        {post.pinned && !post.deletedAt && (
                                            <Badge variant="secondary">
                                                Pinned
                                            </Badge>
                                        )}
                                        {post.deletedAt && <DeletedBadge />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(
                                            post.createdAt.toDate(),
                                        )}
                                    </p>
                                </div>
                                {canRestore && post.deletedAt && onRestore && (
                                    <RestoreButton
                                        label={`Restore “${post.title}”`}
                                        className="shrink-0"
                                        onClick={() => onRestore(post)}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
