import { ImagePlus, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import type { ImageDraft } from '@/lib/post-images';
import { MAX_POST_IMAGES, prepareImage } from '@/lib/post-images';

// Up to MAX_POST_IMAGES photos, shrunk in the browser as they're picked.
export function ImagesField({
    images,
    onChange,
}: {
    images: ImageDraft[];
    onChange: (images: ImageDraft[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const room = MAX_POST_IMAGES - images.length;

    async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
        const files = [...(event.target.files ?? [])];

        event.target.value = '';

        if (files.length === 0) {
            return;
        }

        setBusy(true);
        setError(
            files.length > room
                ? `Only ${MAX_POST_IMAGES} photos per post; the extra ones were skipped.`
                : '',
        );

        const added: ImageDraft[] = [];

        for (const file of files.slice(0, room)) {
            try {
                const prepared = await prepareImage(file);

                added.push({ id: prepared.id, src: prepared.src, prepared });
            } catch (err) {
                setError(getErrorMessage(err));
            }
        }

        onChange([...images, ...added]);
        setBusy(false);
    }

    return (
        <div className="grid gap-2">
            <Label htmlFor="post-images">
                Photos{' '}
                <span className="font-normal text-muted-foreground">
                    (optional, up to {MAX_POST_IMAGES})
                </span>
            </Label>
            {images.length > 0 && (
                <ul className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <li
                            key={image.id}
                            className="relative overflow-hidden rounded-md border bg-muted"
                        >
                            <img
                                src={image.src}
                                alt={`Photo ${index + 1}`}
                                className="aspect-square w-full object-cover"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="absolute top-1 right-1 size-7 rounded-full shadow"
                                aria-label={`Remove photo ${index + 1}`}
                                onClick={() =>
                                    onChange(
                                        images.filter(
                                            (item) => item.id !== image.id,
                                        ),
                                    )
                                }
                            >
                                <X aria-hidden />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            <input
                ref={inputRef}
                id="post-images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={busy || room <= 0}
                onChange={handleFiles}
            />
            <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                disabled={busy || room <= 0}
                onClick={() => inputRef.current?.click()}
            >
                <ImagePlus aria-hidden />
                {busy
                    ? 'Preparing photos…'
                    : room <= 0
                      ? 'Photo limit reached'
                      : 'Add photos'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
