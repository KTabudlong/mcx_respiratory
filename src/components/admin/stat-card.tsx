import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// One dashboard number. `value` null = still loading. With `to`, the whole
// card links to the page behind the number.
export function StatCard({
    label,
    value,
    icon: Icon,
    to,
}: {
    label: string;
    value: number | null;
    icon: LucideIcon;
    to?: string;
}) {
    const content = (
        <Card className="h-full py-4 transition-colors">
            <CardContent className="flex items-center gap-3 px-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon
                        className="size-5 text-muted-foreground"
                        aria-hidden
                    />
                </span>
                <div className="min-w-0">
                    {value === null ? (
                        <Skeleton className="h-7 w-10" />
                    ) : (
                        <p className="text-2xl leading-7 font-semibold">
                            {value}
                        </p>
                    )}
                    <p className="truncate text-sm text-muted-foreground">
                        {label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    if (!to) {
        return content;
    }

    return (
        <Link
            to={to}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&>div]:hover:bg-muted/50"
        >
            {content}
        </Link>
    );
}
