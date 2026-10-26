import { useNavigate, useParams } from 'react-router';

import { PostEditor } from '@/components/posts/post-editor';

// /classes/:classId/posts/:postId/edit — the author or posts.edit_any.
// Cancel and Save go back to the post.
export default function PostEdit() {
    const { classId = '', postId = '' } = useParams();
    const navigate = useNavigate();
    const postPath = `/classes/${classId}/posts/${postId}`;

    return (
        <PostEditor
            classId={classId}
            postId={postId}
            onCancel={() => navigate(postPath)}
            onSaved={() => navigate(postPath, { replace: true })}
        />
    );
}
