import { useCollection } from '@/hooks/use-collection';
import type { Post, PostImage } from '@/types';

// A post's photos in gallery order. Skips the read for posts without any.
export function usePostImages(post: Pick<Post, 'classId' | 'id' | 'imageIds'>) {
    const ids = post.imageIds ?? [];
    const images = useCollection<PostImage>(
        ids.length > 0
            ? `classes/${post.classId}/posts/${post.id}/images`
            : null,
    );
    const byId = new Map(images.data.map((image) => [image.id, image]));

    return {
        images: ids
            .map((id) => byId.get(id))
            .filter((image): image is PostImage => image !== undefined),
        loading: images.loading,
        error: images.error,
    };
}
