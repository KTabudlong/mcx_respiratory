import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { ModerationComments } from '@/components/admin/moderation-comments';
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
    canPosts,
    canComments,
    onToggle,
    onDelete,
    onRestore,
}: {
    post: Post;
    author: UserProfile | undefined;
    open: boolean;
    canPosts: boolean;
    canComments: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onRestore: () => void;
}) {
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
                    {canPosts &&
                        (deleted ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onRestore}
                            >
                                Restore
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        ))}
                </TableCell>
            </TableRow>
            {open && (
                <TableRow>
                    <TableCell
                        colSpan={5}
                        className="bg-muted/40 whitespace-normal"
                    >
                        <ModerationComments post={post} />
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
