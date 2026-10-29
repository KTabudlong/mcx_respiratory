import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getErrorMessage } from '@/lib/errors';
import { setPostPinned, softDeletePost } from '@/lib/posts';
import type { Post } from '@/types';

// The "…" menu on a post. Shows only what this user may do (the rules
// enforce the same checks).
export function PostActions({
    post,
    canEdit,
    canPin,
    canDelete,
    onDeleted,
    onError,
}: {
    post: Post;
    canEdit: boolean;
    canPin: boolean;
    canDelete: boolean;
    onDeleted?: () => void;
    onError: (message: string) => void;
}) {
    const [confirming, setConfirming] = useState(false);

    if (!canEdit && !canPin && !canDelete) {
        return null;
    }

    async function togglePin() {
        try {
            await setPostPinned(post.classId, post.id, !post.pinned);
            toast.success(
                post.pinned ? 'Post unpinned.' : 'Post pinned to top.',
            );
        } catch (err) {
            onError(getErrorMessage(err));
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        aria-label={`Actions for “${post.title}”`}
                    >
                        <MoreHorizontal aria-hidden />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canEdit && (
                        <DropdownMenuItem asChild>
                            <Link
                                to={`/classes/${post.classId}/posts/${post.id}/edit`}
                            >
                                <Pencil aria-hidden />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {canPin && (
                        <DropdownMenuItem onSelect={togglePin}>
                            {post.pinned ? (
                                <PinOff aria-hidden />
                            ) : (
                                <Pin aria-hidden />
                            )}
                            {post.pinned ? 'Unpin' : 'Pin to top'}
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setConfirming(true)}
                        >
                            <Trash2 aria-hidden />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {confirming && (
                <ConfirmDialog
                    title="Delete this post?"
                    description="It disappears from the board for everyone. Moderators can still restore it."
                    confirmLabel="Delete post"
                    successMessage="Post deleted."
                    destructive
                    onConfirm={async () => {
                        // The card (and this dialog) disappears as soon as
                        // the write starts, so a refusal is also reported to
                        // the page.
                        try {
                            await softDeletePost(post.classId, post.id);
                        } catch (err) {
                            onError(getErrorMessage(err));

                            throw err;
                        }

                        onDeleted?.();
                    }}
                    onClose={() => setConfirming(false)}
                />
            )}
        </>
    );
}
