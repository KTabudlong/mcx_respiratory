import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ActionButtonProps = Omit<
    ComponentProps<typeof Button>,
    'variant' | 'children'
> & {
    // Screen-reader name and hover tooltip (`title` overrides the tooltip).
    label?: string;
};

// Every Delete button: red, trash icon only.
export function DeleteButton({
    label = 'Delete',
    size = 'icon-sm',
    title,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            variant="destructive"
            size={size}
            aria-label={label}
            title={title ?? label}
            {...props}
        >
            <Trash2 aria-hidden />
        </Button>
    );
}

// Every Restore button: green, restore icon only.
export function RestoreButton({
    label = 'Restore',
    size = 'icon-sm',
    title,
    className,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/30 dark:bg-green-700 dark:hover:bg-green-600',
                className,
            )}
            {...props}
        >
            <RotateCcw aria-hidden />
        </Button>
    );
}

// Every Edit button: blue, pencil icon only. With `to` it's an in-app link.
export function EditButton({
    label = 'Edit',
    size = 'icon-sm',
    title,
    className,
    to,
    state,
    ...props
}: ActionButtonProps & { to?: string; state?: unknown }) {
    return (
        <Button
            size={size}
            asChild={to !== undefined}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600/30 dark:bg-blue-700 dark:hover:bg-blue-600',
                className,
            )}
            {...props}
        >
            {to !== undefined ? (
                <Link to={to} state={state}>
                    <Pencil aria-hidden />
                </Link>
            ) : (
                <Pencil aria-hidden />
            )}
        </Button>
    );
}
