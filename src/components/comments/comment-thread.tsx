import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { CommentActions } from '@/components/comments/comment-actions';
import { CommentForm } from '@/components/comments/comment-form';
import { CommentMeta } from '@/components/comments/comment-meta';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import type { CommentNode } from '@/lib/comment-tree';
import { countComments } from '@/lib/comment-tree';
import {
    createComment,
    MAX_COMMENT_DEPTH,
    softDeleteComment,
    updateComment,
} from '@/lib/comments';
import type { ClassAccess } from '@/lib/permissions';
import { commentAbilities } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

// Everything a comment needs besides its own node.
export type ThreadContext = {
    classId: string;
    postId: string;
    userId: string | undefined;
    access: ClassAccess;
    classOpen: boolean;
    authors: Map<string, UserProfile>;
};

function CommentItem({
    node,
    context,
}: {
    node: CommentNode;
    context: ThreadContext;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const { comment } = node;
    const hiddenCount = countComments(node.children) + (comment ? 1 : 0);

    return (
        <li className="grid gap-1">
            <div className="flex items-start gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-muted-foreground"
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <Plus aria-hidden /> : <Minus aria-hidden />}
                </Button>
                <div className="grid min-w-0 flex-1 gap-1 pt-0.5">
                    {comment ? (
                        <CommentMeta
                            comment={comment}
                            author={context.authors.get(comment.userId)}
                        />
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            [deleted]
                        </p>
                    )}

                    {collapsed && (
                        <button
                            type="button"
                            className="justify-self-start text-xs text-muted-foreground hover:underline"
                            onClick={() => setCollapsed(false)}
                        >
                            {hiddenCount}{' '}
                            {hiddenCount === 1 ? 'comment' : 'comments'} hidden
                        </button>
                    )}

                    {!collapsed && comment && editing && (
                        <CommentForm
                            label="Edit your comment"
                            initialBody={comment.body}
                            submitLabel="Save"
                            autoFocus
                            onCancel={() => setEditing(false)}
                            onSubmit={async (body) => {
                                await updateComment(comment, body);
                                setEditing(false);
                            }}
                        />
                    )}

                    {!collapsed && comment && !editing && (
                        <>
                            <p className="text-sm break-words whitespace-pre-wrap">
                                {comment.body}
                            </p>
                            <CommentActions
                                {...commentAbilities(
                                    comment,
                                    context.userId,
                                    context.access,
                                    context.classOpen,
                                    MAX_COMMENT_DEPTH,
                                )}
                                onReply={() => setReplying(true)}
                                onEdit={() => setEditing(true)}
                                onDelete={() => setConfirming(true)}
                            />
                        </>
                    )}

                    {!collapsed && comment && replying && (
                        <CommentForm
                            label="Write a reply"
                            submitLabel="Reply"
                            autoFocus
                            onCancel={() => setReplying(false)}
                            onSubmit={async (body) => {
                                await createComment(
                                    context.classId,
                                    context.postId,
                                    context.userId ?? '',
                                    comment,
                                    body,
                                );
                                setReplying(false);
                            }}
                        />
                    )}
                </div>
            </div>

            {!collapsed && node.children.length > 0 && (
                <CommentList
                    nodes={node.children}
                    context={context}
                    className="ml-3 border-l pl-2 sm:pl-3"
                />
            )}

            {comment && confirming && (
                <ConfirmDialog
                    title="Delete this comment?"
                    description="It disappears for everyone; replies stay under a [deleted] marker. Moderators can still restore it."
                    confirmLabel="Delete comment"
                    destructive
                    onConfirm={() => softDeleteComment(comment)}
                    onClose={() => setConfirming(false)}
                />
            )}
        </li>
    );
}

// One level of the thread; CommentItem renders the next level with it.
export function CommentList({
    nodes,
    context,
    className,
}: {
    nodes: CommentNode[];
    context: ThreadContext;
    className?: string;
}) {
    return (
        <ul className={cn('grid gap-3', className)}>
            {nodes.map((node) => (
                <CommentItem key={node.id} node={node} context={context} />
            ))}
        </ul>
    );
}
