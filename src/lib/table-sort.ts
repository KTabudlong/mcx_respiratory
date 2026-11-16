export type SortDir = 'asc' | 'desc';

export type Sort<K extends string> = { key: K; dir: SortDir };

// Clicking a column header cycles ascending → descending → unsorted (null,
// the table's default order). Another column starts at ascending.
export function nextSort<K extends string>(
    current: Sort<K> | null,
    key: K,
): Sort<K> | null {
    if (current?.key !== key) {
        return { key, dir: 'asc' };
    }

    return current.dir === 'asc' ? { key, dir: 'desc' } : null;
}

// Sorts a copy by the value `valueOf` picks (text compares
// case-insensitively).
export function sortRows<T>(
    rows: T[],
    valueOf: (row: T) => string | number,
    dir: SortDir,
) {
    const sign = dir === 'asc' ? 1 : -1;

    return [...rows].sort((a, b) => {
        const left = valueOf(a);
        const right = valueOf(b);
        const order =
            typeof left === 'string' && typeof right === 'string'
                ? left.localeCompare(right, undefined, { sensitivity: 'base' })
                : Number(left) - Number(right);

        return order * sign;
    });
}
