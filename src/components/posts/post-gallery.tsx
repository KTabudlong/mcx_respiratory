import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePostImages } from '@/hooks/use-post-images';
import { getErrorMessage } from '@/lib/errors';
import { imageSrc } from '@/lib/post-images';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

// Photo gallery under a post; a photo opens full size.
export function PostGallery({ post }: { post: Post }) {
    const { images, loading, error } = usePostImages(post);
    const [openId, setOpenId] = useState('');
    const count = post.imageIds?.length ?? 0;

    if (count === 0) {
        return null;
    }

    if (error) {
        return (
            <p className="text-sm text-destructive">
                Couldn't load the photos: {getErrorMessage(error)}
            </p>
        );
    }

    const gridClass = cn(
        'grid gap-2',
        count === 2 && 'grid-cols-2',
        count >= 3 && 'grid-cols-3',
    );

    if (loading) {
        return (
            <div className={gridClass}>
                {post.imageIds?.map((id) => (
                    <Skeleton key={id} className="aspect-square w-full" />
                ))}
            </div>
        );
    }

    const opened = images.find((image) => image.id === openId);
    const openedIndex = opened ? images.indexOf(opened) : -1;

    return (
        <>
            <div className={gridClass}>
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        className="overflow-hidden rounded-md border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={() => setOpenId(image.id)}
                    >
                        <img
                            src={imageSrc(image)}
                            alt={`Photo ${index + 1} of ${images.length}`}
                            width={image.width}
                            height={image.height}
                            className={cn(
                                'w-full object-cover',
                                count === 1
                                    ? 'max-h-[28rem] object-contain'
                                    : 'aspect-square',
                            )}
                        />
                    </button>
                ))}
            </div>

            {opened && (
                <Dialog open onOpenChange={(open) => !open && setOpenId('')}>
                    <DialogContent className="max-w-[min(64rem,calc(100vw-2rem))] p-2 sm:max-w-[min(64rem,calc(100vw-2rem))]">
                        <DialogTitle className="sr-only">
                            Photo {openedIndex + 1} of {images.length}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {post.title}
                        </DialogDescription>
                        <img
                            src={imageSrc(opened)}
                            alt={`Photo ${openedIndex + 1} of ${images.length}`}
                            className="max-h-[85dvh] w-full rounded-md object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
