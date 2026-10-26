import { RotateCcw, Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';

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
