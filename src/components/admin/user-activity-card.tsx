import { Link } from 'react-router';

import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import type { UserActivity } from '@/lib/stats';
import type { ClassGroup, Post } from '@/types';

// Post / comment totals and the newest posts, across every class.
export function UserActivityCard({
    activity,
    posts,
    loading,
    error,
    classById,
}: {
    activity: UserActivity | null;
    posts: Post[];
    loading: boolean;
    error: Error | null;
    classById: Map<string, ClassGroup>;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <p className="text-sm text-muted-foreground">
                    {activity
                        ? `${activity.posts} posts · ${activity.comments} comments (deleted included)`
                        : 'Counting…'}
                </p>
                <FormMessage message={error ? getErrorMessage(error) : ''} />
                {loading ? (
                    <PageLoader />
                ) : posts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No posts yet.
                    </p>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {posts.map((post) => (
                            <li
                                key={`${post.classId}/${post.id}`}
                                className="grid gap-0.5 px-3 py-2"
                            >
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
                                    {post.deletedAt && (
                                        <Badge variant="outline">Deleted</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {classById.get(post.classId)?.name ?? '…'} ·{' '}
                                    {formatDateTime(post.createdAt.toDate())}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
