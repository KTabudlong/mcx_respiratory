import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getErrorMessage } from '@/lib/errors';
import {
    load,
    PHOTO_SAVE_TIMEOUT_MS,
    REQUEST_TIMEOUT_MS,
    save,
    saveTimeoutFor,
} from '@/lib/save';

describe('save / load timeouts', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('passes through a request that finishes in time', async () => {
        await expect(save(Promise.resolve('ok'))).resolves.toBe('ok');
        await expect(load(Promise.resolve(3))).resolves.toBe(3);
    });

    it('passes through a request that fails in time', async () => {
        const result = save(Promise.reject({ code: 'permission-denied' }));

        await expect(result).rejects.toEqual({ code: 'permission-denied' });
    });

    it('gives up on a save after 30 seconds', async () => {
        const caught = save(new Promise(() => {})).catch(
            (error: unknown) => error,
        );

        await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

        expect(getErrorMessage(await caught)).toMatch(
            /^There's a problem reaching the server, so this wasn't saved/,
        );
    });

    it('gives up on a load after 30 seconds', async () => {
        const caught = load(new Promise(() => {})).catch(
            (error: unknown) => error,
        );

        await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

        expect(getErrorMessage(await caught)).toMatch(
            /^There's a problem reaching the server\. Try again later\./,
        );
    });

    it('allows longer for saves with photos', () => {
        expect(saveTimeoutFor(0)).toBe(REQUEST_TIMEOUT_MS);
        expect(saveTimeoutFor(2)).toBe(PHOTO_SAVE_TIMEOUT_MS);
    });
});
