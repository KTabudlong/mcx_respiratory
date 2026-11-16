import { FormMessage } from '@/components/common/form-message';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { useUsersById } from '@/hooks/use-users-by-id';
import { formatDateTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import type { Post, PostChange, PostEdit, UserProfile } from '@/types';

const CHANGE_LABELS: Record<PostChange, string> = {
    title: 'title',
    body: 'text',
    links: 'links',
    photos: 'photos',
};

function fullName(user: UserProfile | undefined) {
    return user ? `${user.firstName} ${user.lastName}` : '…';
}

// Who edited a post and when, newest first. Edits made before the history
// began aren't logged; the post's own "last edited" fills in for those.
// Rendered only while open.
export function EditHistoryDialog({
    post,
    onClose,
}: {
    post: Post;
    onClose: () => void;
}) {
    const edits = useCollection<PostEdit>(
        `classes/${post.classId}/posts/${post.id}/edits`,
    );
    const users = useUsersById([
        ...edits.data.map((edit) => edit.editorId),
        ...(post.editedBy ? [post.editedBy] : []),
    ]);
    const sorted = [...edits.data].sort(
        (a, b) => b.editedAt.toMillis() - a.editedAt.toMillis(),
    );

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit history</DialogTitle>
                    <DialogDescription className="break-words">
                        {post.title}
                    </DialogDescription>
                </DialogHeader>
                {edits.error && (
                    <FormMessage message={getErrorMessage(edits.error)} />
                )}
                {edits.loading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                ) : sorted.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {post.editedBy && post.editedAt
                            ? `Last edited by ${fullName(users.get(post.editedBy))} on ${formatDateTime(post.editedAt.toDate())}. Edits before the history began aren't listed.`
                            : 'No edits yet.'}
                    </p>
                ) : (
                    <ol className="grid gap-2">
                        {sorted.map((edit) => (
                            <li
                                key={edit.id}
                                className="grid gap-0.5 rounded-md border bg-card p-3 text-sm"
                            >
                                <span className="font-medium">
                                    {fullName(users.get(edit.editorId))}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDateTime(edit.editedAt.toDate())}
                                    {edit.changes.length > 0 &&
                                        ` · changed ${edit.changes
                                            .map(
                                                (change) =>
                                                    CHANGE_LABELS[change],
                                            )
                                            .join(', ')}`}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
                <p className="text-xs text-muted-foreground">
                    Posted {formatDateTime(post.createdAt.toDate())}
                </p>
            </DialogContent>
        </Dialog>
    );
}
