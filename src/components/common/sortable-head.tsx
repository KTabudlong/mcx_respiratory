import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { TableHead } from '@/components/ui/table';
import type { SortDir } from '@/lib/table-sort';
import { cn } from '@/lib/utils';

// A column header you click to sort by it; clicking again flips the order.
// `dir` is null when the table is sorted by another column.
export function SortableHead({
    children,
    dir,
    onSort,
    className,
}: {
    children: ReactNode;
    dir: SortDir | null;
    onSort: () => void;
    className?: string;
}) {
    const Icon =
        dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;

    return (
        <TableHead
            className={className}
            aria-sort={
                dir === 'asc'
                    ? 'ascending'
                    : dir === 'desc'
                      ? 'descending'
                      : 'none'
            }
        >
            <button
                type="button"
                onClick={onSort}
                className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                {children}
                <Icon
                    aria-hidden
                    className={cn('size-3.5', !dir && 'opacity-40')}
                />
            </button>
        </TableHead>
    );
}
