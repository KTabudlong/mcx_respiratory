import { DeleteButton } from '@/components/common/action-buttons';
import { Button } from '@/components/ui/button';

// Reply / Edit / Delete under a comment; only the allowed ones show.
export function CommentActions({
    canReply,
    canEdit,
    canDelete,
    onReply,
    onEdit,
    onDelete,
}: {
    canReply: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    if (!canReply && !canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="-ml-2 flex flex-wrap gap-1">
            {canReply && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={onReply}
                >
                    Reply
                </Button>
            )}
            {canEdit && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={onEdit}
                >
                    Edit
                </Button>
            )}
            {canDelete && (
                <DeleteButton
                    size="icon-xs"
                    label="Delete comment"
                    onClick={onDelete}
                />
            )}
        </div>
    );
}
