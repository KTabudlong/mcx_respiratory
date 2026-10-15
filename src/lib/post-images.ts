import { Bytes } from 'firebase/firestore';

import type { PostImage } from '@/types';

// Photos are shrunk in the browser and stored as Firestore bytes (Firebase
// Storage needs the paid Blaze plan). Keep in sync with the images rules.
export const MAX_POST_IMAGES = 3;
const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 400;
// The rules allow 700 KB; a Firestore document maxes out at 1 MiB.
const TARGET_BYTES = 450_000;
const QUALITIES = [0.82, 0.7, 0.55];

export type PreparedImage = {
    id: string;
    type: 'image/webp' | 'image/jpeg';
    bytes: Uint8Array;
    width: number;
    height: number;
    // data: URL for the preview, built once.
    src: string;
};

// A photo in the post form: already saved (prepared null) or new.
export type ImageDraft = {
    id: string;
    src: string;
    prepared: PreparedImage | null;
};

// Scale down (never up) so the longer side is at most `max`.
export function fitWithin(width: number, height: number, max: number) {
    const scale = Math.min(1, max / Math.max(width, height));

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

export function imageSrc(image: Pick<PostImage, 'type' | 'data'>) {
    return `data:${image.type};base64,${image.data.toBase64()}`;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
    return new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality),
    );
}

// WebP where the browser can encode it (falls back to JPEG, e.g. older
// Safari), stepping quality and then size down until it fits.
async function encode(bitmap: ImageBitmap, maxDimension: number) {
    const size = fitWithin(bitmap.width, bitmap.height, maxDimension);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error("This browser can't process images.");
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(bitmap, 0, 0, size.width, size.height);

    for (const quality of QUALITIES) {
        let blob = await toBlob(canvas, 'image/webp', quality);

        if (!blob || blob.type !== 'image/webp') {
            blob = await toBlob(canvas, 'image/jpeg', quality);
        }

        if (blob && blob.size <= TARGET_BYTES) {
            return { blob, ...size };
        }
    }

    return null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
    if (!file.type.startsWith('image/')) {
        throw new Error(`"${file.name}" isn't an image.`);
    }

    let bitmap: ImageBitmap;

    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error(`Couldn't read "${file.name}". Try a JPG or PNG.`);
    }

    try {
        for (
            let max = MAX_DIMENSION;
            max >= MIN_DIMENSION;
            max = Math.round(max * 0.75)
        ) {
            const result = await encode(bitmap, max);

            if (result) {
                const type =
                    result.blob.type === 'image/webp'
                        ? 'image/webp'
                        : 'image/jpeg';
                const bytes = new Uint8Array(await result.blob.arrayBuffer());

                return {
                    id: crypto.randomUUID(),
                    type,
                    bytes,
                    width: result.width,
                    height: result.height,
                    src: `data:${type};base64,${Bytes.fromUint8Array(bytes).toBase64()}`,
                };
            }
        }
    } finally {
        bitmap.close();
    }

    throw new Error(`"${file.name}" couldn't be shrunk enough. Try another.`);
}
