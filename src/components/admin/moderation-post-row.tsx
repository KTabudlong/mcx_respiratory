import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Pencil,
    Pin,
    PinOff,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { ModerationComments } from '@/components/admin/moderation-comments';
import {
    DeleteButton,
    RestoreButton,
} from '@/components/common/action-buttons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/dates';
import type { Post, UserProfile } from '@/types';

// One post in the moderation table, plus its comments when expanded.
export function ModerationPostRow({
    post,
    author,
    open,
    matchIds,
    canPosts,
    canComments,
    canEdit,
    canPin,
    onToggle,
    onDelete,
    onRestore,
    onTogglePin,
}: {
    post: Post;
    author: UserProfile | undefined;
    open: boolean;
    // Comments matching the search (highlighted when open).
    matchIds?: Set<string>;
    // canPosts = delete / restore posts; canEdit / canPin are per post.
    canPosts: boolean;
    canComments: boolean;
    canEdit: boolean;
    canPin: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onRestore: () => void;
    onTogglePin: () => void;
}) {
    const location = useLocation();
    const deleted = post.deletedAt !== null;

    return (
        <>
            <TableRow className={deleted ? 'text-muted-foreground' : undefined}>
                <TableCell className="max-w-xs">
                    <div className="flex items-center gap-1">
                        {canComments && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 shrink-0"
                                aria-expanded={open}
                                aria-label={`${open ? 'Hide' : 'Show'} comments on “${post.title}”`}
                                onClick={onToggle}
                            >
                                {open ? (
                                    <ChevronDown aria-hidden />
                                ) : (
                                    <ChevronRight aria-hidden />
                                )}
                            </Button>
                        )}
                        <span className="truncate font-medium">
                            {post.title}
                        </span>
                        {post.pinned && (
                            <Badge variant="secondary">Pinned</Badge>
                        )}
                        {matchIds && (
                            <Badge
                                variant="outline"
                                className="border-amber-400 text-amber-700 dark:text-amber-300"
                            >
                                {matchIds.size === 1
                                    ? '1 comment matches'
                                    : `${matchIds.size} comments match`}
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                    {author ? `${author.firstName} ${author.lastName}` : '…'}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                    {formatDateTime(post.createdAt.toDate())}
                </TableCell>
                <TableCell>
                    <Badge variant={deleted ? 'outline' : 'default'}>
                        {deleted ? 'Deleted' : 'Live'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                    {!deleted && (
                        <Button asChild size="sm" variant="ghost">
                            <Link
                                to={`/classes/${post.classId}/posts/${post.id}`}
                                target="_blank"
                                rel="noopener"
                            >
                                <ExternalLink aria-hidden />
                                <span className="sr-only">
                                    Open “{post.title}” on the board (new tab)
                                </span>
                            </Link>
                        </Button>
                    )}
                    {!deleted && canEdit && (
                        <Button
                            asChild
                            size="icon-sm"
                            variant="ghost"
                            title="Edit post"
                        >
                            <Link
                                to={`/admin/classes/${post.classId}/moderation/${post.id}`}
                                state={{
                                    from: `${location.pathname}${location.search}`,
                                }}
                                aria-label={`Edit “${post.title}”`}
                            >
                                <Pencil aria-hidden />
                            </Link>
                        </Button>
                    )}
                    {!deleted && canPin && (
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            title={post.pinned ? 'Unpin' : 'Pin to top'}
                            aria-label={post.pinned ? 'Unpin' : 'Pin to top'}
                            aria-pressed={post.pinned}
                            onClick={onTogglePin}
                        >
                            {post.pinned ? (
                                <PinOff aria-hidden />
                            ) : (
                                <Pin aria-hidden />
                            )}
                        </Button>
                    )}
                    {canPosts &&
                        (deleted ? (
                            <RestoreButton
                                label="Restore post"
                                onClick={onRestore}
                            />
                        ) : (
                            <DeleteButton
                                label="Delete post"
                                onClick={onDelete}
                            />
                        ))}
                </TableCell>
            </TableRow>
            {open && (
                <TableRow>
                    <TableCell
                        colSpan={5}
                        className="bg-muted/40 whitespace-normal"
                    >
                        <ModerationComments
                            post={post}
                            highlightIds={matchIds}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
