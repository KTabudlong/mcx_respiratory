import { useLocation, useNavigate, useParams } from 'react-router';

import { PostEditor } from '@/components/posts/post-editor';

// /admin/classes/:classId/moderation/:postId — edit a post without leaving
// the admin panel. Cancel and Save return to Moderation with the filter /
// sort it had (passed as `from` in the link's state).
export default function AdminPostEdit() {
    const { classId = '', postId = '' } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const from: unknown = location.state?.from;
    const back =
        typeof from === 'string'
            ? from
            : `/admin/classes/${classId}/moderation`;

    return (
        <PostEditor
            classId={classId}
            postId={postId}
            onCancel={() => navigate(back)}
            onSaved={() => navigate(back, { replace: true })}
        />
    );
}
