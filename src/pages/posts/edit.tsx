import { useNavigate, useParams } from 'react-router';

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
import { updatePost } from '@/lib/posts';
import { postBodyHtml } from '@/lib/rich-text';
import type { ClassGroup, Post } from '@/types';

// /classes/:classId/posts/:postId/edit — the author or posts.edit_any.
export default function PostEdit() {
    const { classId = '', postId = '' } = useParams();
    const navigate = useNavigate();
    const { user, accessIn } = useAuth();
    const post = useDocument<Post>(`classes/${classId}/posts/${postId}`);
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const images = usePostImages(
        post.data ?? { classId, id: postId, imageIds: [] },
    );
    const postPath = `/classes/${classId}/posts/${postId}`;

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
                        onCancel={() => navigate(postPath)}
                        onSubmit={async (input, drafts) => {
                            const imageIds = drafts.map((draft) => draft.id);

                            await updatePost(
                                classId,
                                postId,
                                user?.uid ?? '',
                                input,
                                input.pinned !== post.data?.pinned,
                                {
                                    imageIds,
                                    added: drafts.flatMap((draft) =>
                                        draft.prepared ? [draft.prepared] : [],
                                    ),
                                    removedIds: savedIds.filter(
                                        (id) => !imageIds.includes(id),
                                    ),
                                },
                            );
                            navigate(postPath, { replace: true });
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
