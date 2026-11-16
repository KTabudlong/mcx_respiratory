import type { FormEvent } from 'react';
import { lazy, Suspense, useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { ImagesField } from '@/components/posts/images-field';
import type { LinkRow } from '@/components/posts/links-field';
import { LinksField } from '@/components/posts/links-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/errors';
import type { ImageDraft } from '@/lib/post-images';
import type { PostInput } from '@/lib/posts';
import { MAX_TITLE_LENGTH, preparePost } from '@/lib/posts';

// The editor is the heaviest part of the board, so it loads with the form.
const RichTextEditor = lazy(() =>
    import('@/components/posts/rich-text-editor').then((module) => ({
        default: module.RichTextEditor,
    })),
);

// Create and edit share this form. `initial.body` is editor HTML;
// `onSubmit` gets the cleaned post and the photos in gallery order.
export function PostForm({
    initial,
    initialImages,
    canPin,
    submitLabel,
    onSubmit,
    onCancel,
}: {
    initial: PostInput;
    initialImages: ImageDraft[];
    canPin: boolean;
    submitLabel: string;
    onSubmit: (post: PostInput, images: ImageDraft[]) => Promise<void>;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(initial.title);
    const [body, setBody] = useState(initial.body);
    const [images, setImages] = useState(initialImages);
    const [links, setLinks] = useState<LinkRow[]>(() =>
        initial.links.map((link) => ({ ...link, key: crypto.randomUUID() })),
    );
    const [pinned, setPinned] = useState(initial.pinned);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = preparePost({ title, body, links, pinned });

        setError(result.error);

        if (!result.post) {
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit(result.post, images);
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <FormMessage message={error} />
            <div className="grid gap-2">
                <Label htmlFor="post-title">Title</Label>
                <Input
                    id="post-title"
                    maxLength={MAX_TITLE_LENGTH}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label id="post-body-label">
                    Text{' '}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </Label>
                <Suspense fallback={<Skeleton className="h-52 w-full" />}>
                    <RichTextEditor
                        value={initial.body}
                        labelledBy="post-body-label"
                        onChange={setBody}
                    />
                </Suspense>
            </div>
            <ImagesField images={images} onChange={setImages} />
            <LinksField links={links} onChange={setLinks} />
            {canPin && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="post-pinned"
                        checked={pinned}
                        onCheckedChange={(checked) =>
                            setPinned(checked === true)
                        }
                    />
                    <Label htmlFor="post-pinned" className="font-normal">
                        Pin to the top of the board
                    </Label>
                </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
