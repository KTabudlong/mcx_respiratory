import { useEffect, useState } from 'react';

import { REQUEST_TIMEOUT_MS, timeoutError } from '@/lib/save';

const LOAD_TIMEOUT = timeoutError('load-timeout');

// Live listeners never fail when the server can't be reached; they wait.
// After REQUEST_TIMEOUT_MS still loading, this returns an error so the page
// shows a message instead of a spinner forever. `key` identifies what is
// loading (the timer restarts when it changes). If the data arrives later,
// loading ends and the error goes away by itself.
export function useLoadTimeout(key: string | null, loading: boolean) {
    const [timedOutKey, setTimedOutKey] = useState<string | null>(null);

    useEffect(() => {
        if (key === null || !loading) {
            return;
        }

        const timer = setTimeout(() => setTimedOutKey(key), REQUEST_TIMEOUT_MS);

        return () => clearTimeout(timer);
    }, [key, loading]);

    return key !== null && loading && timedOutKey === key ? LOAD_TIMEOUT : null;
}
