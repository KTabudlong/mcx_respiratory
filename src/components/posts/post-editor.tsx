import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { PostForm } from '@/components/posts/post-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import { usePostImages } from '@/hooks/use-post-images';
import { getErrorMessage } from '@/lib/errors';
import { postAbilities } from '@/lib/permissions';
import { imageSrc } from '@/lib/post-images';
import { postChanges, setPostPinned, updatePost } from '@/lib/posts';
import { postBodyHtml } from '@/lib/rich-text';
import type { ClassGroup, Post } from '@/types';

// The edit-post card, shared by the board and the admin panel; each page
// decides where Cancel / Save go. The author or posts.edit_any.
export function PostEditor({
    classId,
    postId,
    onCancel,
    onSaved,
}: {
    classId: string;
    postId: string;
    onCancel: () => void;
    onSaved: () => void;
}) {
    const { user, accessIn } = useAuth();
    const post = useDocument<Post>(`classes/${classId}/posts/${postId}`);
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const images = usePostImages(
        post.data ?? { classId, id: postId, imageIds: [] },
    );

    if (post.loading || classGroup.loading || images.loading) {
        return <PageLoader />;
    }

    const abilities = post.data
        ? postAbilities(
              post.data,
              user?.uid,
              accessIn(classId),
              classGroup.data?.archivedAt === null,
          )
        : null;
    const editable =
        post.data && post.data.deletedAt === null && abilities?.canEdit;
    const savedIds = post.data?.imageIds ?? [];

    return (
        <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Edit post</CardTitle>
                <CardDescription>{classGroup.data?.name}</CardDescription>
            </CardHeader>
            <CardContent>
                {images.error && (
                    <FormMessage message={getErrorMessage(images.error)} />
                )}
                {!post.data || !abilities || !editable ? (
                    <p className="text-sm text-muted-foreground">
                        This post can't be edited: it was deleted, the class is
                        archived, or it isn't yours.
                    </p>
                ) : (
                    <PostForm
                        initial={{
                            ...post.data,
                            body: postBodyHtml(post.data),
                        }}
                        initialImages={images.images.map((image) => ({
                            id: image.id,
                            src: imageSrc(image),
                            prepared: null,
                        }))}
                        canPin={abilities.canPin}
                        submitLabel="Save changes"
                        onCancel={onCancel}
                        onSubmit={async (input, drafts) => {
                            const saved = post.data;

                            if (!saved) {
                                return;
                            }

                            const imageIds = drafts.map((draft) => draft.id);
                            const pinnedChanged = input.pinned !== saved.pinned;
                            const changes = postChanges(
                                {
                                    ...saved,
                                    bodyHtml: postBodyHtml(saved),
                                },
                                input,
                                imageIds,
                            );

                            if (changes.length === 0) {
                                if (pinnedChanged) {
                                    await setPostPinned(
                                        classId,
                                        postId,
                                        input.pinned,
                                    );
                                }

                                toast.success(
                                    pinnedChanged
                                        ? input.pinned
                                            ? 'Post pinned to top.'
                                            : 'Post unpinned.'
                                        : 'Nothing changed.',
                                );
                                onSaved();

                                return;
                            }

                            await updatePost(
                                classId,
                                postId,
                                user?.uid ?? '',
                                input,
                                pinnedChanged,
                                {
                                    imageIds,
                                    added: drafts.flatMap((draft) =>
                                        draft.prepared ? [draft.prepared] : [],
                                    ),
                                    removedIds: savedIds.filter(
                                        (id) => !imageIds.includes(id),
                                    ),
                                },
                                {
                                    editCount: saved.editCount ?? 0,
                                    changes,
                                },
                            );
                            toast.success('Post saved.');
                            onSaved();
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
