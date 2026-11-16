import { useEffect, useState } from 'react';

import {
    fetchClassStats,
    fetchSiteStats,
    fetchUserActivity,
} from '@/lib/stats';
import type { ClassStats, SiteStats, UserActivity } from '@/lib/stats';

type Result<T> = { key: string; stats: T | null; error: Error | null };

// Counts for one class's dashboard; fetched again when the class or the
// viewer's permissions change.
export function useClassStats(
    classId: string,
    canSeeDeleted: boolean,
    canSeeRequests: boolean,
) {
    const key = `${classId}|${canSeeDeleted}|${canSeeRequests}`;
    const [result, setResult] = useState<Result<ClassStats> | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchClassStats(classId, canSeeDeleted, canSeeRequests).then(
            (stats) => !cancelled && setResult({ key, stats, error: null }),
            (error: Error) =>
                !cancelled && setResult({ key, stats: null, error }),
        );

        return () => {
            cancelled = true;
        };
    }, [key, classId, canSeeDeleted, canSeeRequests]);

    const current = result?.key === key ? result : null;

    return { stats: current?.stats ?? null, error: current?.error ?? null };
}

// Post / comment totals for one user (super admin user page).
export function useUserActivity(userId: string) {
    const [result, setResult] = useState<Result<UserActivity> | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchUserActivity(userId).then(
            (stats) =>
                !cancelled && setResult({ key: userId, stats, error: null }),
            (error: Error) =>
                !cancelled && setResult({ key: userId, stats: null, error }),
        );

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const current = result?.key === userId ? result : null;

    return { stats: current?.stats ?? null, error: current?.error ?? null };
}

// Site-wide counts for the super admin dashboard. `enabled` is false for
// everyone else so the (forbidden) queries never run.
export function useSiteStats(enabled: boolean) {
    const [result, setResult] = useState<Result<SiteStats> | null>(null);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        fetchSiteStats().then(
            (stats) => !cancelled && setResult({ key: '', stats, error: null }),
            (error: Error) =>
                !cancelled && setResult({ key: '', stats: null, error }),
        );

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    return { stats: result?.stats ?? null, error: result?.error ?? null };
}
