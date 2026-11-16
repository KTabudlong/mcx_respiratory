// A filter / tab read from the URL (e.g. `?status=deactivated`), so links
// can open a page with it already selected. Unknown values fall back.
export function pickParam<T extends string>(
    value: string | null,
    allowed: readonly T[],
    fallback: T,
): T {
    return allowed.find((option) => option === value) ?? fallback;
}

// A copy of the URL params with some changed; null removes one (used for
// defaults, so plain URLs stay clean).
export function withParams(
    current: URLSearchParams,
    changes: Record<string, string | null>,
) {
    const next = new URLSearchParams(current);

    for (const [key, value] of Object.entries(changes)) {
        if (value === null) {
            next.delete(key);
        } else {
            next.set(key, value);
        }
    }

    return next;
}
