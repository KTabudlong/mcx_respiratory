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
import { createPost } from '@/lib/posts';
import type { ClassGroup } from '@/types';

const EMPTY_POST = { title: '', body: '', links: [], pinned: false };

// /classes/:classId/posts/new — needs posts.create (guarded in the router).
export default function PostNew() {
    const { classId = '' } = useParams();
    const navigate = useNavigate();
    const { user, canIn } = useAuth();
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const feedPath = `/classes/${classId}`;

    if (classGroup.loading) {
        return <PageLoader />;
    }

    return (
        <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
                <CardTitle>New post</CardTitle>
                <CardDescription>
                    {classGroup.data?.name}: everyone in the class will see it.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {classGroup.data?.archivedAt !== null ? (
                    <p className="text-sm text-muted-foreground">
                        This class is archived, so new posts are closed.
                    </p>
                ) : (
                    <PostForm
                        initial={EMPTY_POST}
                        initialImages={[]}
                        canPin={canIn(classId, 'posts.pin')}
                        submitLabel="Post"
                        onCancel={() => navigate(feedPath)}
                        onSubmit={async (post, images) => {
                            const id = await createPost(
                                classId,
                                user?.uid ?? '',
                                post,
                                images.flatMap((image) =>
                                    image.prepared ? [image.prepared] : [],
                                ),
                            );

                            navigate(`${feedPath}/posts/${id}`, {
                                replace: true,
                            });
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
