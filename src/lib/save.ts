// How long any server request may take before the user is told there's a
// problem. Firestore never fails a request it can't send (offline, ad
// blocker, server trouble): it just waits.
export const REQUEST_TIMEOUT_MS = 30_000;
// Photos (up to ~450 KB each) can take a while on a slow phone connection.
export const PHOTO_SAVE_TIMEOUT_MS = 60_000;

export function saveTimeoutFor(photoCount: number) {
    return photoCount > 0 ? PHOTO_SAVE_TIMEOUT_MS : REQUEST_TIMEOUT_MS;
}

// `code` is mapped to a message in lib/errors.
export function timeoutError(code: 'save-timeout' | 'load-timeout') {
    return Object.assign(new Error(code), { code });
}

export function withTimeout<T>(
    request: Promise<T>,
    code: 'save-timeout' | 'load-timeout',
    ms = REQUEST_TIMEOUT_MS,
): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(timeoutError(code)), ms);
    });

    return Promise.race([request, timeout]).finally(() => clearTimeout(timer));
}

// Every write. A write that times out stays queued in this tab until the
// page is reloaded, so the message tells the user to reload first.
export function save<T>(write: Promise<T>, ms = REQUEST_TIMEOUT_MS) {
    return withTimeout(write, 'save-timeout', ms);
}

// One-off reads (counts, single documents).
export function load<T>(read: Promise<T>) {
    return withTimeout(read, 'load-timeout');
}
