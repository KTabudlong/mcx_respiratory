// A filter / tab read from the URL (e.g. `?status=deactivated`), so links
// can open a page with it already selected. Unknown values fall back.
export function pickParam<T extends string>(
    value: string | null,
    allowed: readonly T[],
    fallback: T,
): T {
    return allowed.find((option) => option === value) ?? fallback;
}
