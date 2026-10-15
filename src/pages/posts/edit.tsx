import { useNavigate, useParams } from 'react-router';

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
import { postAbilities } from '@/lib/permissions';
import { updatePost } from '@/lib/posts';
import type { ClassGroup, Post } from '@/types';

// /classes/:classId/posts/:postId/edit — the author or posts.edit_any.
export default function PostEdit() {
    const { classId = '', postId = '' } = useParams();
    const navigate = useNavigate();
    const { user, accessIn } = useAuth();
    const post = useDocument<Post>(`classes/${classId}/posts/${postId}`);
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const postPath = `/classes/${classId}/posts/${postId}`;

    if (post.loading || classGroup.loading) {
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

    return (
        <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Edit post</CardTitle>
                <CardDescription>{classGroup.data?.name}</CardDescription>
            </CardHeader>
            <CardContent>
                {!post.data || !abilities || !editable ? (
                    <p className="text-sm text-muted-foreground">
                        This post can't be edited: it was deleted, the class is
                        archived, or it isn't yours.
                    </p>
                ) : (
                    <PostForm
                        initial={post.data}
                        canPin={abilities.canPin}
                        submitLabel="Save changes"
                        onCancel={() => navigate(postPath)}
                        onSubmit={async (input) => {
                            await updatePost(
                                classId,
                                postId,
                                input,
                                input.pinned !== post.data?.pinned,
                            );
                            navigate(postPath, { replace: true });
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
