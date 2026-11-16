import { useState } from 'react';
import { Link } from 'react-router';

import { CommentPreviewDialog } from '@/components/admin/comment-preview-dialog';
import {
    OpenTabButton,
    RestoreButton,
    ViewButton,
} from '@/components/common/action-buttons';
import { DeletedBadge } from '@/components/common/deleted-badge';
import { FormMessage } from '@/components/common/form-message';
import { NativeSelect } from '@/components/common/native-select';
import { PageLoader } from '@/components/common/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import type { UserActivity } from '@/lib/stats';
import type { HistoryDateFilter, UserHistoryEvent } from '@/lib/user-history';
import { filterUserHistory, HISTORY_DATE_FILTERS } from '@/lib/user-history';
import type { Comment, Post } from '@/types';

// Totals plus a timestamped history of class changes, posts, and comments.
export function UserActivityCard({
    activity,
    events,
    loading,
    error,
    canRestore = false,
    onRestore,
}: {
    activity: UserActivity | null;
    events: UserHistoryEvent[];
    loading: boolean;
    error: Error | null;
    canRestore?: boolean;
    onRestore?: (post: Post) => void;
}) {
    const [dateFilter, setDateFilter] = useState<HistoryDateFilter>('all');
    const [previewComment, setPreviewComment] = useState<Comment | null>(null);
    const visible = filterUserHistory(events, dateFilter);

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                <CardTitle>Activity</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="activity-date" className="sr-only">
                        Filter by date
                    </Label>
                    <NativeSelect
                        id="activity-date"
                        className="w-auto"
                        value={dateFilter}
                        onChange={(event) =>
                            setDateFilter(
                                event.target.value as HistoryDateFilter,
                            )
                        }
                    >
                        {HISTORY_DATE_FILTERS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </NativeSelect>
                </div>
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
                ) : events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No activity yet.
                    </p>
                ) : visible.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No activity in this date range.
                    </p>
                ) : (
                    <ul className="max-h-80 divide-y overflow-y-auto rounded-md border bg-card">
                        {visible.map((event) => {
                            const hasCommentActions =
                                event.comment !== undefined ||
                                event.viewCommentHref !== undefined;
                            const hasPostRestore =
                                canRestore &&
                                event.restorePost !== undefined &&
                                onRestore !== undefined;

                            return (
                                <li
                                    key={event.id}
                                    className="flex items-start justify-between gap-2 px-3 py-2"
                                >
                                    <div className="grid min-w-0 gap-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {event.href ? (
                                                <Link
                                                    to={event.href}
                                                    className="text-sm font-medium underline-offset-4 hover:underline"
                                                >
                                                    {event.text}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-medium">
                                                    {event.text}
                                                </p>
                                            )}
                                            {event.deleted && <DeletedBadge />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(event.at)}
                                        </p>
                                    </div>
                                    {(hasCommentActions || hasPostRestore) && (
                                        <div className="flex shrink-0 gap-1">
                                            {event.comment && (
                                                <ViewButton
                                                    label="View comment"
                                                    title="Preview comment"
                                                    onClick={() =>
                                                        setPreviewComment(
                                                            event.comment!,
                                                        )
                                                    }
                                                />
                                            )}
                                            {event.viewCommentHref && (
                                                <OpenTabButton
                                                    label="Open comment on the board"
                                                    title="Open in new tab"
                                                    to={event.viewCommentHref}
                                                />
                                            )}
                                            {hasPostRestore && (
                                                <RestoreButton
                                                    label={`Restore “${event.restorePost!.title}”`}
                                                    onClick={() =>
                                                        onRestore!(
                                                            event.restorePost!,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>

            {previewComment && (
                <CommentPreviewDialog
                    comment={previewComment}
                    canRestore={canRestore}
                    onClose={() => setPreviewComment(null)}
                />
            )}
        </Card>
    );
}
