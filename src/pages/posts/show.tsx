import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { PostComments } from '@/components/comments/post-comments';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { LinkChips } from '@/components/posts/link-chips';
import { PostActions } from '@/components/posts/post-actions';
import { PostBody } from '@/components/posts/post-body';
import { PostGallery } from '@/components/posts/post-gallery';
import { PostMeta } from '@/components/posts/post-meta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import { getErrorMessage } from '@/lib/errors';
import { postAbilities } from '@/lib/permissions';
import type { ClassGroup, Post, UserProfile } from '@/types';

// /classes/:classId/posts/:postId
export default function PostShow() {
    const { classId = '', postId = '' } = useParams();
    const navigate = useNavigate();
    const { user, accessIn } = useAuth();
    const post = useDocument<Post>(`classes/${classId}/posts/${postId}`);
    const author = useDocument<UserProfile>(
        post.data ? `users/${post.data.userId}` : null,
    );
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const [actionError, setActionError] = useState('');
    const feedPath = `/classes/${classId}`;

    const backLink = (
        <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-self-start"
        >
            <Link to={feedPath}>
                <ArrowLeft aria-hidden />
                Back to the board
            </Link>
        </Button>
    );

    if (post.loading) {
        return <PageLoader />;
    }

    // Deleted posts are hidden from everyone but the author and moderators
    // (the rules deny the read, so that shows up as an error here).
    if (!post.data || post.error || post.data.deletedAt !== null) {
        return (
            <div className="mx-auto grid max-w-3xl gap-4">
                {backLink}
                <p className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                    This post was deleted or doesn't exist.
                </p>
            </div>
        );
    }

    const abilities = postAbilities(
        post.data,
        user?.uid,
        accessIn(classId),
        classGroup.data?.archivedAt === null,
    );

    return (
        <div className="mx-auto grid max-w-3xl gap-4">
            {backLink}
            <FormMessage message={actionError} />
            <article className="grid gap-4 rounded-lg border bg-card p-4 shadow-xs sm:p-6">
                <div className="flex items-start justify-between gap-2">
                    <PostMeta
                        post={post.data}
                        author={author.data ?? undefined}
                    />
                    <PostActions
                        post={post.data}
                        {...abilities}
                        onDeleted={() => navigate(feedPath)}
                        onError={setActionError}
                    />
                </div>
                <h1 className="text-2xl leading-tight font-semibold break-words">
                    {post.data.title}
                </h1>
                <PostBody post={post.data} />
                <PostGallery post={post.data} />
                <LinkChips links={post.data.links} />
            </article>
            {author.error && (
                <FormMessage message={getErrorMessage(author.error)} />
            )}
            <PostComments
                post={post.data}
                classOpen={classGroup.data?.archivedAt === null}
            />
        </div>
    );
}
